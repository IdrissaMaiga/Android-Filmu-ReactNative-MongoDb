declare module 'accordion-collapse-react-native' {
    import * as React from 'react';
  
    export interface CollapseProps {
      isExpanded?: boolean;
      onToggle?: () => void;
      children?: React.ReactNode; // Allow children
    }
  
    export class Collapse extends React.Component<CollapseProps> {}
    export class CollapseHeader extends React.Component {}
    export class CollapseBody extends React.Component {}
  }
  