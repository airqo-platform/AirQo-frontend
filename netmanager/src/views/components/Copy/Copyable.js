import React, { useState, useRef } from "react";
import CopyIcon, { CopySuccessIcon } from "assets/img/CopyIcon";

const Copyable = ({ value, className, width, format }) => {
  const copyRef = useRef();
  const [copied, setCopied] = useState(false);

  const onClick = () => {
    // let comp = document.getElementById(componentID);
    let comp = copyRef.current;
    let textArea = document.createElement("textarea");
    textArea.value = comp.textContent;
    document.body.appendChild(textArea);
    /* Select the text field */
    textArea.select();
    textArea.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");
    textArea.remove();
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        ref={copyRef}
        style={{
          width: width || "200px",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {value}
      </span>
      {copied ? (
        <CopySuccessIcon />
      ) : (
        <CopyIcon onClick={onClick} className={className} />
      )}
    </div>
  );
};

export default Copyable;
