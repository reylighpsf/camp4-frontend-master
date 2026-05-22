import { request } from "../../axios/axios";
import { todoSchema } from "./todoSchema";

export const todoApi = {
  getAll: (signal) => request({ method: "get", url: "/todos", signal }),

  create: (data) => {
    const parsed = todoSchema.parse(data);
    return request({ method: "post", url: "/todos", data: parsed });
  },

  update: (id, data) => {
    const parsed = todoSchema.partial().parse(data);
    return request({
      method: "put",
      url: `/todos/${id}`,
      data: parsed,
    });
  },

  remove: (id) => request({ method: "delete", url: `/todos/${id}` }),
};
