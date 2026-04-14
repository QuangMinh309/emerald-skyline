import { TableColumn } from "@/components/ui/Table";
import { Text } from "react-native";

const tierColumns: TableColumn<any>[] = [
  {
    header: "Mức sử dụng",
    width: "w-[30%]",
    align: "center",
    accessor: (item) => (
      <Text className="text-[11px] font-semibold text-black">{item.name}</Text>
    ),
  },
  {
    header: "Tiêu thụ",
    width: "w-[25%]",
    align: "center",
    accessor: (item) => <Text className="text-[11px] text-black">{item.usage}</Text>,
  },
  {
    header: "Đơn giá",
    align: "center",
    accessor: (item) => <Text className="text-[11px] text-black">{item.price}</Text>,
  },
  {
    header: "Thành tiền",
    align: "right",
    width: "w-[25%]",
    accessor: (item) => (
      <Text className="font-semibold text-[11px] text-main text-right">
        {item.total} đ
      </Text>
    ),
  },
];

export default tierColumns;
