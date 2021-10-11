import React, { useEffect, useRef, useState } from "react";
import { EuiFieldText } from "@elastic/eui";

export function StepTitleEditField({ onStepTitleChange, setIsEditing, title }) {
  const [tempText, setTempText] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  function updateTitle() {
    onStepTitleChange(tempText);
    setIsEditing(false);
  }

  return (
    <EuiFieldText
      aria-label="Sets the title for the current step."
      onKeyDown={e => {
        if (e.key == "Enter") {
          updateTitle();
        } else if (e.key == "Escape") {
          setIsEditing(false);
        }
      }}
      onBlur={updateTitle}
      onChange={e => {
        setTempText(e.target.value);
      }}
      placeholder={title}
      inputRef={inputRef}
      style={{ minWidth: 350 }}
      value={tempText}
    />
  );
}
