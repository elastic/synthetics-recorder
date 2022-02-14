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

import { EuiPopover, EuiContextMenu, EuiIcon, EuiText } from "@elastic/eui";
import React from "react";
import { Setter } from "../../common/types";
import { ActionControlButton } from "./ControlButton";

export function ActionSettingsPopover({
  isVisible: visible,
  isOpen,
  setIsOpen,
  onAddAssertion,
  onDelete,
  onEdit,
}: {
  isVisible: boolean;
  isOpen: boolean;
  onAddAssertion: () => void;
  onDelete: () => void;
  onEdit: () => void;
  setIsOpen: Setter<boolean>;
}) {
  return (
    <EuiPopover
      button={
        <ActionControlButton
          iconType="boxesHorizontal"
          isVisible={visible}
          onClick={() => setIsOpen(!isOpen)}
        />
      }
      closePopover={() => setIsOpen(false)}
      isOpen={isOpen}
      panelPaddingSize="s"
    >
      <EuiContextMenu
        initialPanelId={0}
        panels={[
          {
            id: 0,
            items: [
              {
                icon: "plusInCircle",
                name: "Add assertion",
                onClick: onAddAssertion,
              },
              {
                icon: "pencil",
                name: "Edit action",
                onClick: onEdit,
              },
              {
                icon: <EuiIcon type="trash" color="danger" />,
                name: <EuiText color="danger">Delete action</EuiText>,
                onClick: onDelete,
              },
            ],
          },
        ]}
      />
    </EuiPopover>
  );
}
