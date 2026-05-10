import React from "react";
import { TextInput, type TextInputProps } from "react-native";

import { designTokens, textFieldStyles } from "@/constants/designTokens";

/**
 * Text input using DESIGN.md `text-input` (8px radius, 12×14 padding, hairline border).
 */
export const TextField = React.forwardRef<TextInput, TextInputProps>(
  function TextField({ style, placeholderTextColor, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? designTokens.colors.muted}
        style={[textFieldStyles.input, style]}
        {...props}
      />
    );
  }
);
