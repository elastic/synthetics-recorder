import { useEffect, useRef, useState } from "react";
import { EuiFieldText } from "@elastic/eui";
import { Setter } from "../../common/types";

interface IStepTitleEditField {
  onStepTitleChange: (text: string) => void;
  setIsEditing: Setter<boolean>;
  title: string;
}

export function StepTitleEditField({
  onStepTitleChange,
  setIsEditing,
  title,
}: IStepTitleEditField) {
  const [tempText, setTempText] = useState<string>(title);
  const inputRef = useRef<HTMLInputElement>(null);

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
        if (e.key === "Enter") {
          updateTitle();
        } else if (e.key === "Escape") {
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
