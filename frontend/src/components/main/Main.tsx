import { createContext, useState } from "react";
import Body from "../body";
import Header from "../header";
import { Branch } from "../types";

export const BranchContext = createContext<Branch | undefined>(undefined);

export function Main() {
  const [branch, setBranch] = useState({} as Branch)

  return(
    <>
      <BranchContext.Provider value={branch}>
        <Header onBranchChange={setBranch}></Header>
        <Body></Body>
      </BranchContext.Provider>
    </>);
}
