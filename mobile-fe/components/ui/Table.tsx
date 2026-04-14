import { cn } from "@/utils/cn";
import React from "react";
import { Text, View } from "react-native";

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string;
  align?: "left" | "center" | "right";
  isHeader?: boolean;
}

interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  footerComponent?: React.ReactNode;
}

export function GenericTable<T>({
  data,
  columns,
  title,
  footerComponent,
}: GenericTableProps<T>) {
  // căn chỉnh container
  const getAlignClass = (align?: string) => {
    if (align === "center") return "items-center";
    if (align === "right") return "items-end";
    return "items-start";
  };

  // căn chỉnh text
  const getTextAlignClass = (align?: string) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <>
      {title && (
        <View className="mb-3">
          <Text className="font-bold text-lg text-main">{title}</Text>
        </View>
      )}

      {/* header */}
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
        <View className="flex-row py-3 px-3 bg-third border-b border-gray-300">
          {columns.map((col, index) => (
            <View
              key={index}
              className={cn(
                col.width || "flex-1",
                "justify-center",
                getAlignClass(col.align),
              )}
            >
              <Text
                className={cn(
                  "text-[12.5px] font-extrabold text-black",
                  getTextAlignClass(col.align),
                )}
              >
                {col.header}
              </Text>
            </View>
          ))}
        </View>

        {/* body */}
        <View>
          {data.map((item, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            return (
              <View
                key={rowIndex}
                className={cn(
                  "flex-row py-3 px-3 border-b border-gray-50 items-center",
                  isEven ? "bg-white" : "bg-[#EFEAE1]/35",
                )}
              >
                {columns.map((col, colIndex) => {
                  const value =
                    typeof col.accessor === "function"
                      ? col.accessor(item)
                      : item[col.accessor];

                  return (
                    <View
                      key={colIndex}
                      className={cn(
                        col.width || "flex-1",
                        "justify-center",
                        getAlignClass(col.align),
                      )}
                    >
                      {React.isValidElement(value) ? (
                        value
                      ) : (
                        <Text
                          className={cn(
                            "text-xs",
                            getTextAlignClass(col.align),
                            col.isHeader
                              ? "font-bold text-black"
                              : "font-medium text-gray-800",
                          )}
                        >
                          {value as string}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        {footerComponent && (
          <View className="py-4 pl-20 pr-2 bg-white border-t border-gray-200">
            {footerComponent}
          </View>
        )}
      </View>
    </>
  );
}
