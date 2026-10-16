import { singleton } from "tsyringe";
import { prisma } from "../../prisma";
import {
  DocumentCreateInput,
  DocumentUncheckedCreateInput,
  DocumentUpdateInput,
  DocumentUncheckedUpdateInput,
  DocumentWhereUniqueInput,
  DocumentWhereInput,
} from "../../generated/prisma/models/Document";
import { DocumentStatus } from "../../generated/prisma/enums";

@singleton()
export class DocumentRepository {
  async createDocument(data: DocumentCreateInput | DocumentUncheckedCreateInput) {
    return prisma.document.create({ data });
  }

  async updateDocument(
    where: DocumentWhereUniqueInput,
    data: DocumentUpdateInput | DocumentUncheckedUpdateInput,
  ) {
    return prisma.document.update({
      where,
      data,
    });
  }

  async updateStatus(id: string, status: DocumentStatus) {
    return prisma.document.update({
      where: { id },
      data: { status },
    });
  }

  async findDocumentById(id: string) {
    return prisma.document.findUnique({
      where: { id },
    });
  }

  async findDocumentByIdOrThrow(id: string) {
    return prisma.document.findUniqueOrThrow({
      where: { id },
    });
  }

  async findDocumentBy(query: DocumentWhereInput) {
    return prisma.document.findFirst({
      where: query,
    });
  }

  /**
   * Used to detect duplicate submissions.
   * Returns the first document that matches the given filename and status.
   */
  async findDocumentByFilenameAndStatus(
    filename: string,
    status: DocumentStatus,
  ) {
    return prisma.document.findFirst({
      where: { filename, status },
    });
  }

  async deleteDocument(where: DocumentWhereUniqueInput) {
    return prisma.document.delete({
      where,
    });
  }
}
