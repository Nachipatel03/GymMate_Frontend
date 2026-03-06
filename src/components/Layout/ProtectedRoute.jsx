import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || (!user.role && user.role !== "") || !allowedRoles.includes(user.role.toLowerCase())) {
      // If user doesn't have the required role, redirect them somewhere safe
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
