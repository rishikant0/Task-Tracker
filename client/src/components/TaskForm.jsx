import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createTask, updateTask } from "../services/api";

const TaskForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateTask(initialData._id, data);
        toast.success("Task updated successfully");
      } else {
        await createTask(data);
        toast.success("Task created successfully");
        reset();
      }

      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Task" : "Create New Task"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block mb-2 font-medium">Title</label>

          <input
            type="text"
            placeholder="Enter task title"
            className="w-full border rounded-lg p-3"
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
            })}
          />

          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium">Description</label>

          <textarea
            rows={4}
            placeholder="Enter task description"
            className="w-full border rounded-lg p-3"
            {...register("description", {
              required: "Description is required",
            })}
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block mb-2 font-medium">Status</label>

          <select
            className="w-full border rounded-lg p-3"
            {...register("status")}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block mb-2 font-medium">Priority</label>

          <select
            className="w-full border rounded-lg p-3"
            {...register("priority")}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block mb-2 font-medium">Due Date</label>

          <input
            type="date"
            className="w-full border rounded-lg p-3"
            {...register("dueDate")}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {isEdit ? "Update Task" : "Save Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;