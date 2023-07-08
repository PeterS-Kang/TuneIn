import { createContext, useContext, useState } from "react";

const RoomContext = createContext()

export const RoomContextProvider = ({children}) => {
    const [nameContext, setNameContext] = useState()
    const [codeContext, setCodeContext] = useState()
    return (
        <RoomContext.Provider value={{nameContext, setNameContext, codeContext, setCodeContext}}>
            {children}
        </RoomContext.Provider>
    )
}
export const RoomInfo = () => {
    return useContext(RoomContext)
}