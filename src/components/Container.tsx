import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  classNames?: string;
}

const Container: React.FC<ContainerProps> = ({ children, classNames = "" }) => {
  return <div className={`mx-auto max-w-xl ${classNames}`}>{children}</div>;
};

export default Container;
