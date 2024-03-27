import React from "react";

function MainButton({ value }) {
  return (
    <button
      type="submit"
      className="btnfont btn btn-wide  bg-primary border-none hover:bg-blue-700"
    >
      {value}
    </button>
  );
}

export default MainButton;
