import { useState } from "react";

export default function useCheckError() {
  const [errorFields, setErrorFields] = useState<string[]>([]);

  const checkError = (field: string, value: number | string) => {
    switch (field) {
      case "title":
        if (value == "") {
          setErrorFields(errorFields.concat(["title"]));
        } else setErrorFields(errorFields.filter((elem) => elem != field));
        break;
      case "price":
        if (value == 0) {
          setErrorFields(errorFields.concat(["price"]));
        } else setErrorFields(errorFields.filter((elem) => elem != field));
        break;
      case "description":
        if (typeof value == "string" && value.length > 1000) {
          setErrorFields(errorFields.concat(["description"]));
        } else setErrorFields(errorFields.filter((elem) => elem != field));
        break;
      case "category":
        if (value == "") {
          setErrorFields(errorFields.concat(["category"]));
        } else setErrorFields(errorFields.filter((elem) => elem != field));
        break;
    }
  };

  return { errorFields, checkError };
}
