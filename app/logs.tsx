import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ERRORS_STORAGE } from "@/constants/Storage";
import { useStoredValue } from "@/hooks/useStoredValue";
import { ScrollView } from "react-native";

export default function Logs() {
  const {
    value: storedLogs,
    setValue: setStoredLogs,
    loading: isLoadingStoredLogs,
  } = useStoredValue<any[]>(ERRORS_STORAGE, []);

  return (
    <VStack className="w-full p-4 gap-4">
      <ScrollView className="w-full h-full">
        {!isLoadingStoredLogs && (storedLogs || []).length > 0 ? (
          storedLogs?.map((log, index) => (
            <VStack key={index} className="w-full p-4 bg-gray-100 rounded-md">
              <Text className="text-gray-700">
                {JSON.stringify(log, null, 2)}
              </Text>
            </VStack>
          ))
        ) : (
          <Text className="text-gray-500">No logs available</Text>
        )}
      </ScrollView>
    </VStack>
  );
}
