import React from "react";
import MaterialTable from "material-table";

export default function({className, style, ...props }) {
    return (
            <div
                className={className || ""}
                style={style || {}}
            >
                <MaterialTable
                    { ...props }
                />
            </div>
        )
}
