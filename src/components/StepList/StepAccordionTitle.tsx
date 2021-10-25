import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { StepTitleEditField } from "./StepTitleEditField";

interface IStepAccordionTitle {
  index: number;
  isEditing: boolean;
  onStepTitleChange: (updatedTitle: string) => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
}

export function StepAccordionTitle({
  index,
  isEditing,
  onStepTitleChange,
  setIsEditing,
  title,
}: IStepAccordionTitle) {
  const stepIndexString = `Step ${index + 1}`;
  if (isEditing) {
    return (
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <strong>{stepIndexString}</strong>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <StepTitleEditField
            onStepTitleChange={onStepTitleChange}
            setIsEditing={setIsEditing}
            title={title}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiText style={{ marginTop: 1 }} size="s">
      <strong style={{ marginRight: 38 }}>{stepIndexString}</strong>
      {title}
    </EuiText>
  );
}
