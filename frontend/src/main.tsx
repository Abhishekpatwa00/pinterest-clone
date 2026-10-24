import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import "./index.css";

import { Homepage } from "./pages/homepage.tsx";
import { Auth } from "./pages/auth.tsx";
import { Post } from "./pages/post.tsx";
import { Create } from "./pages/create.tsx";
import { SearchPage } from "./pages/searchpage.tsx";
import { UserPage } from "./pages/userpage.tsx";
import { MainLayout } from "./pages/layouts/mainlayout.tsx";
import { userAuthStore } from "@/lib/authStore";


const queryClient = new QueryClient();

const App = () => {
  const { currentUser } = userAuthStore();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/user/:userName" element={<UserPage />} />
        <Route
          path="/create"
          element={currentUser ? <Create /> : <Navigate to="/auth" replace />}
        />
        <Route path="/pin/:id" element={<Post />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>

      <Route path="/" element={<Homepage />} />
      <Route
        path="/auth"
        element={currentUser ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
