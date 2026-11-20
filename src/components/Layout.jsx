// src/components/Layout.jsx
import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from "./Sidebar";
import Appbar from "./Appbar";
import ToastrContainer from "./Toastr";

export default function Layout({ children }) {
  const [sbWidth, setSbWidth] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1"
        ? SIDEBAR_WIDTH_COLLAPSED
        : SIDEBAR_WIDTH;
    } catch {
      return SIDEBAR_WIDTH;
    }
  });
  const handleCollapse = useCallback(
    (_collapsed, width) => setSbWidth(width),
    [],
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        background: "#f4f8f7",
        textAlign: "left",
        margin: 0,
        maxWidth: "none",
      }}
    >
      <Sidebar onCollapseChange={handleCollapse} />
      <ToastrContainer />
      <div
        style={{
          marginLeft: sbWidth,
          minWidth: 0,
          transition: "margin-left .24s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <Appbar />
        <main>{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
