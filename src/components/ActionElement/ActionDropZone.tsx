/*
MIT License

Copyright (c) 2021-present, Elastic NV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import React, { useContext, useState } from "react";
import styled from "styled-components";
import { DRAG_AND_DROP_DATA_TRANSFER_TYPE } from "../../common/shared";
import { StepSeparatorDragDropDataTransfer } from "../../common/types";
import { DragAndDropContext } from "../../contexts/DragAndDropContext";
import { StepsContext } from "../../contexts/StepsContext";
import { useDrop } from "../../hooks/useDrop";

interface DropZoneStyleProps {
  isDraggedOver: boolean;
}

const DropZoneStyle = styled.div<DropZoneStyleProps>`
  height: 8px;
  border-radius: 4px;
  ${({ isDraggedOver, theme }) =>
    isDraggedOver &&
    `
    background-color: ${theme.colors.accent};
    opacity: 1;
    transition: background-color 0.3s;
  `}
  ${({ isDraggedOver, theme }) =>
    !isDraggedOver &&
    `
    background-color: ${theme.colors.success};
    opacity: 0.75;
    transition: background-color 0.3s;
  `}
`;

interface IDropZone {
  actionIndex: number;
  stepIndex: number;
}

export function DropZone({ actionIndex, stepIndex }: IDropZone) {
  const { onDropStep } = useContext(StepsContext);
  const { dragIndex } = useContext(DragAndDropContext);
  const { isDroppable } = useDrop(stepIndex, actionIndex, dragIndex);
  const [dropzoneOver, setDropzeonOver] = useState(false);
  if (isDroppable && dragIndex !== undefined) {
    return (
      <DropZoneStyle
        id={`drop-zone-${stepIndex}-${actionIndex}`}
        isDraggedOver={dropzoneOver}
        onDragOver={e => {
          e.preventDefault();
        }}
        onDragLeave={_ => {
          setDropzeonOver(false);
        }}
        onDragEnter={e => {
          setDropzeonOver(true);
          e.preventDefault();
        }}
        onDrop={e => {
          const { initiatorIndex } = JSON.parse(
            e.dataTransfer.getData(DRAG_AND_DROP_DATA_TRANSFER_TYPE)
          ) as StepSeparatorDragDropDataTransfer;
          setDropzeonOver(false);
          onDropStep(stepIndex, initiatorIndex, actionIndex);
          e.preventDefault();
        }}
      />
    );
  }
  return null;
}
