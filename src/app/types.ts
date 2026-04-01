export interface TemplateTextBox {
  id: string;
  x: number; // left % of canvas
  y: number; // top % of canvas
  width: number; // width % of canvas
  fontFamily: string;
  fontSize: number; // px
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface TemplateSlideConfig {
  bgImage: string | null;
  textBoxes: TemplateTextBox[];
}

export interface CustomTemplate {
  id: string;
  name: string;
  language?: string;
  fontFamily?: string;
  slides: TemplateSlideConfig[];
  createdAt: number;
}
