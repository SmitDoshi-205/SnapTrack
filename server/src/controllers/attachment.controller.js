import prisma from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { emitBoardEvent } from "../realtime/socket.js";

// Helper
async function getBoardIdFromTask(taskId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { column: { select: { boardId: true } } },
  });
  return task?.column?.boardId || null;
}

async function requireMembership(taskId, userId) {
  const boardId = await getBoardIdFromTask(taskId);
  if (!boardId) return null;
  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  return member ? boardId : null;
}

//  Upload attachment

export async function uploadAttachment(req, res, next) {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const boardId = await requireMembership(taskId, req.user.id);
    if (!boardId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let fileUrl = req.file.secure_url || req.file.path;

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        uploadedBy: req.user.id,
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size || 0,
      },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });

    emitBoardEvent(boardId, "board:changed", { reason: "attachment-added" });

    res.status(201).json({ success: true, data: { attachment } });
  } catch (err) {
    next(err);
  }
}

//  Get attachments for a task

export async function getAttachments(req, res, next) {
  try {
    const { taskId } = req.params;

    const boardId = await requireMembership(taskId, req.user.id);
    if (!boardId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: { attachments } });
  } catch (err) {
    next(err);
  }
}

//  Delete attachment

export async function deleteAttachment(req, res, next) {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { task: { include: { column: { select: { boardId: true } } } } },
    });

    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" });
    }

    // Only the uploader or board owner can delete
    const board = await prisma.board.findUnique({
      where: { id: attachment.task.column.boardId },
    });

    const canDelete =
      attachment.uploadedBy === req.user.id || board?.ownerId === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Delete from Cloudinary
    try {
      const urlParts = attachment.fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1].split(".")[0];
      const publicId = `snaptrack/attachments/${fileName}`;

      const isPdf = attachment.fileType === "application/pdf";
      const isImage = attachment.fileType.startsWith("image/");

      await cloudinary.uploader.destroy(publicId, {
        resource_type: isImage || isPdf ? "image" : "raw", // PDFs are 'image' type in Cloudinary
      });
    } catch {
      console.warn("[Cloudinary] Failed to delete file from Cloudinary");
    }

    await prisma.attachment.delete({ where: { id } });

    emitBoardEvent(attachment.task.column.boardId, "board:changed", {
      reason: "attachment-deleted",
    });

    res.json({ success: true, message: "Attachment deleted" });
  } catch (err) {
    next(err);
  }
}