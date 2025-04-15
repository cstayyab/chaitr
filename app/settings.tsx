import { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { set, z } from "zod";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { useStoredValue } from "@/hooks/useStoredValue";
import { Spinner } from "@/components/ui/spinner";
import { SETTINGS_STORAGE } from "@/constants/Storage";
import { useToast } from "@/components/ui/toast";
import { Text } from "@/components/ui/text";

// zod schema for form validation
const formSchema = z.object({
  ipAddress: z
    .string({
      required_error: "IP address is required",
      invalid_type_error: "IP address must be a string",
    })
    .min(7, "IP address must be at least 7 characters long"),
  port: z
    .number({
      required_error: "Port number is required",
      invalid_type_error: "Port number must be a number",
      coerce: true
    })
    .gte(1, "Port number should be between 1 and 65535")
    .lte(65535, "Port number should be between 1 and 65535"),
});

type FlattenedErrors = z.inferFlattenedErrors<typeof formSchema>;
type FieldErrors = FlattenedErrors["fieldErrors"];
type FormErrors = FlattenedErrors["formErrors"];

export type ISettings = z.infer<typeof formSchema>;

export default function Settings() {
  const toast = useToast()
  const {value, setValue, loading} = useStoredValue<z.infer<typeof formSchema>>(SETTINGS_STORAGE);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema>>({
    ipAddress: value?.ipAddress  || '',
    port: value?.port || 3000 ,
  });

  const [disabledSubmit, setSubmitDisabled] = useState(false);


  useEffect(() => {
    if(!loading) {
      setFormValues({
        ipAddress: value?.ipAddress  || '',
        port: value?.port || 3000 ,
      });
    }
  }, [loading])

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>();
  const [formErrors, setFormErrors] = useState<FormErrors>();

  const handleChange = (name: keyof typeof formSchema.shape, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    setSubmitDisabled(true);
    const { success, error, data } = formSchema.safeParse(formValues);
    if (!success) {
      const errors = error.flatten();
      setFieldErrors(errors.fieldErrors);
      setFormErrors(errors.formErrors);
      console.log(errors.formErrors);
      console.log(errors.fieldErrors);
      setSubmitDisabled(false);
      return;
    } else {
      setFieldErrors(undefined);
      setFormErrors(undefined);
      setValue(data);
      toast.show({
        avoidKeyboard: true,
        render: (props) => {
          return (
            <VStack
              className="w-full p-4 bg-green-500 rounded-md mt-safe-or-16"
              {...props}
            >
              <Text className="text-white">
                Settings saved successfully!
              </Text>
            </VStack>
          );
        },
        placement: "top",
        duration: 2000,
        onCloseComplete: () => setSubmitDisabled(false),
      });
    }
  };
  if(loading) {
    return (
      <VStack className="w-full p-4 gap-4">
        <Spinner />
      </VStack>
    );
  }
  return (
    <VStack className="w-full p-4 gap-4">
      <FormControl
        isInvalid={!!fieldErrors?.ipAddress}
        isRequired={true}
        size="lg"
        isDisabled={false}
        isReadOnly={false}
      >
        <FormControlLabel>
          <FormControlLabelText>IP Address</FormControlLabelText>
        </FormControlLabel>
        <Input className="my-1" size={"md"}>
          <InputField
            type="text"
            placeholder="Enter Chat Server's IP address"
            value={formValues.ipAddress}
            onChangeText={(text) => handleChange("ipAddress", text)}
          />
        </Input>
        <FormControlHelper>
          <FormControlHelperText>
            Should be a valid IP address.
          </FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>
            {fieldErrors?.ipAddress?.join('\n')}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl
        isInvalid={!!fieldErrors?.port}
        isRequired={true}
        size="lg"
        isDisabled={false}
        isReadOnly={false}
      >
        <FormControlLabel>
          <FormControlLabelText>Port Number</FormControlLabelText>
        </FormControlLabel>
        <Input className="my-1" size={"md"}>
          <InputField
            type="text"
            placeholder="Enter Chat Server's Port Number"
            value={formValues.port + ""}
            onChangeText={(text) => handleChange("port", text)}
            keyboardType="numeric"
            maxLength={5}
            autoComplete="off"
            autoCorrect={false}
          />
        </Input>
        <FormControlHelper>
          <FormControlHelperText>
            Should be a valid numeric Port Number
          </FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>
            {fieldErrors?.port?.join('\n')}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <Button className="w-full self-end mt-4 disabled:bg-gray-400" size="lg" onPress={handleSubmit} disabled={disabledSubmit}>
        <ButtonText size="lg">Save</ButtonText>
      </Button>
    </VStack>
  );
}
