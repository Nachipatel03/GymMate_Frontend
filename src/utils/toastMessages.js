import { toast } from "sonner";

/* ----------------------- SUCCESS TOASTS ----------------------- */

export const toastSuccess = {
  created: (entity) =>
    toast.success(`${entity} created successfully`),

  updated: (entity) =>
    toast.success(`${entity} updated successfully`),

  deleted: (entity) =>
    toast.success(`${entity} deleted successfully`),

  fetched: (entity) =>
    toast.success(`${entity} loaded successfully`),
};

/* ------------------------ ERROR TOASTS ------------------------ */

export const toastError = {
   validation: (msg) => toast.error(msg),
   
  fetch: (entity) =>
    toast.error(`Failed to load ${entity}`),

  create: (entity) =>
    toast.error(`Failed to create ${entity}`),

  update: (entity) =>
    toast.error(`Failed to update ${entity}`),

  delete: (entity) =>
    toast.error(`Failed to delete ${entity}`),

  custom: (message) =>
    toast.error(message),
  forbidden: (message) => toast.error(message),
};

/* ----------------------- INFO / WARNING ----------------------- */

export const toastInfo = {
  notAllowed: (message) =>
    toast.warning(message),

  confirmFirst: () =>
    toast.info("Please confirm before continuing"),
};
