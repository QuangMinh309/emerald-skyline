import { TableColumn } from "@/components/ui/Table";
import { StatisticsItem } from "@/types/payment";
import { Text } from "react-native";

const statisticsColumns: TableColumn<StatisticsItem>[] = [
  {
    header: "Tháng",
    width: "w-[18%]",
    align: "center",
    accessor: (item) => (
      <Text className="text-[11px] font-medium text-black">{item.month}</Text>
    ),
  },
  {
    header: "Điện",
    align: "center",
    accessor: (item) => <Text className="text-[11px] text-black">{item.elec}</Text>,
  },
  {
    header: "Nước",
    align: "center",
    accessor: (item) => <Text className="text-[11px] text-black">{item.water}</Text>,
  },
  {
    header: "Phí QL",
    align: "center",
    accessor: (item) => <Text className="text-[11px] text-black">{item.service}</Text>,
  },
  {
    header: "Tổng",
    width: "w-[22%]",
    align: "center",
    accessor: (item) => (
      <Text className="text-[11px] font-bold text-main">{item.total}</Text>
    ),
  },
];

export default statisticsColumns;
