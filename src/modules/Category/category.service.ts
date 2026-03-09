import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { TCategoryCreatePayload, TCategoryUpdatePayload } from "./category.interface";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return categories;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return category;
};

const createCategory = async (payload: TCategoryCreatePayload) => {
  const existingName = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (existingName) {
    throw new AppError(409, "A category with this name already exists");
  }

  const existingSlug = await prisma.category.findUnique({
    where: { slug: payload.slug },
  });
  if (existingSlug) {
    throw new AppError(409, "A category with this slug already exists");
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const updateCategory = async (id: string, payload: TCategoryUpdatePayload) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Category not found");
  }

  if (payload.name && payload.name !== existing.name) {
    const nameConflict = await prisma.category.findUnique({
      where: { name: payload.name },
    });
    if (nameConflict) {
      throw new AppError(409, "A category with this name already exists");
    }
  }

  if (payload.slug && payload.slug !== existing.slug) {
    const slugConflict = await prisma.category.findUnique({
      where: { slug: payload.slug },
    });
    if (slugConflict) {
      throw new AppError(409, "A category with this slug already exists");
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Category not found");
  }

  const mealCount = await prisma.meal.count({
    where: { categoryId: id },
  });
  if (mealCount > 0) {
    throw new AppError(
      400,
      `Cannot delete category. It has ${mealCount} meal(s) assigned to it.`
    );
  }

  await prisma.category.delete({ where: { id } });

  return { message: "Category deleted successfully" };
};

export const CategoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
