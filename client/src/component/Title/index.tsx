import React from "react";
import "./index.scss";

interface TitleProps {
  children: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({ children }) => {
  return <h1 className="title">{children}</h1>;
};

export default Title;
