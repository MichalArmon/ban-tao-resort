import React from "react";
import "./FullScreenImage.css";

export default function FullScreenImage({ bgSrc = "landscape2.jpg" }) {
  return (
    <>
      <div className="fixed-bg">
        <img src={bgSrc} alt="Background" />
      </div>
    </>
  );
}
