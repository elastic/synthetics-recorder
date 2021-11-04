import { EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { StepTitleEditField } from "./StepTitleEditField";
import { Setter } from "../../common/types";

interface IStepAccordionTitle {
  index: number;
  isEditing: boolean;
  onStepTitleChange: (updatedTitle: string) => void;
  setIsEditing: Setter<boolean>;
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
