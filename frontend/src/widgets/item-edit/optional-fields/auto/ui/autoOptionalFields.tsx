import type { AutoParams, DraftState, ItemParams } from "@/shared/types/items";
import { Flex, Input, Select } from "antd";

export default function AutoOptionalFields({
  draft,
  handleChange,
  setDraft,
  setParamString,
  setParamNumber
}: {
  draft: DraftState,
  handleChange: () => void,
  setDraft: React.Dispatch<React.SetStateAction<DraftState | null>>,
  setParamString: (key: string, value: string) => void
  setParamNumber: (key: string, raw: string) => void
}) {
  return (
    <Flex
                      vertical
                      gap={8}
                      style={{ width: "100%", alignItems: "start" }}
                    >
                      <Input
                        status={
                          String((draft.params as AutoParams).brand ?? "") == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Бренд"
                        value={String((draft.params as AutoParams).brand ?? "")}
                        onChange={(e) =>
                          setParamString("brand", e.target.value)
                        }
                      />
                      <Input
                        status={
                          String((draft.params as AutoParams).model ?? "") == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Модель"
                        value={String((draft.params as AutoParams).model ?? "")}
                        onChange={(e) =>
                          setParamString("model", e.target.value)
                        }
                      />
                      <Input
                        status={
                          String(
                            (draft.params as AutoParams).yearOfManufacture ??
                              "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Год выпуска"
                        type="number"
                        value={
                          (draft.params as AutoParams).yearOfManufacture ===
                          undefined
                            ? ""
                            : String(
                                (draft.params as AutoParams).yearOfManufacture,
                              )
                        }
                        onChange={(e) =>
                          setParamNumber("yearOfManufacture", e.target.value)
                        }
                        step={1}
                      />
                      <Select
                        status={
                          String(
                            (draft.params as AutoParams).transmission ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{
                          width: "100%",
                          maxWidth: "456px",
                          textAlign: "left",
                        }}
                        placeholder="Коробка"
                        value={(draft.params as AutoParams).transmission ?? ""}
                        options={[
                          { value: "", label: "Не указано" },
                          { value: "automatic", label: "Автомат" },
                          { value: "manual", label: "Механика" },
                        ]}
                        onChange={(value) => {
                          handleChange();
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  params: {
                                    ...(prev.params as Record<string, unknown>),
                                    transmission: value as
                                      | "automatic"
                                      | "manual"
                                      | undefined,
                                  } as Partial<ItemParams>,
                                }
                              : prev,
                          );
                        }}
                      />
                      <Input
                        status={
                          String((draft.params as AutoParams).mileage ?? "") ==
                          ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Пробег"
                        type="number"
                        value={
                          (draft.params as AutoParams).mileage === undefined
                            ? ""
                            : String((draft.params as AutoParams).mileage)
                        }
                        onChange={(e) =>
                          setParamNumber("mileage", e.target.value)
                        }
                        step={1}
                        min={0}
                      />
                      <Input
                        status={
                          String(
                            (draft.params as AutoParams).enginePower ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Мощность двигателя"
                        type="number"
                        value={
                          (draft.params as AutoParams).enginePower === undefined
                            ? ""
                            : String((draft.params as AutoParams).enginePower)
                        }
                        onChange={(e) =>
                          setParamNumber("enginePower", e.target.value)
                        }
                        step={1}
                        min={0}
                      />
                    </Flex>
  )
}