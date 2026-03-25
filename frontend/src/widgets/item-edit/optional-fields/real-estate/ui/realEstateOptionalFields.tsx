import type { DraftState, ItemParams, RealEstateParams } from "@/shared/types/items";
import { Flex, Input, Select } from "antd";

export default function RealEstateOptionalFields({
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
                          <Select
                            status={
                              (draft.params as RealEstateParams).type
                                ? "validating"
                                : "warning"
                            }
                            style={{
                              width: "100%",
                              maxWidth: "456px",
                              textAlign: "left",
                            }}
                            placeholder="Тип"
                            value={(draft.params as RealEstateParams).type ?? ""}
                            options={[
                              { value: "", label: "Не указано" },
                              { value: "flat", label: "Квартира" },
                              { value: "house", label: "Дом" },
                              { value: "room", label: "Комната" },
                            ]}
                            onChange={(value) => {
                              handleChange();
                              setDraft((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      params: {
                                        ...(prev.params as Record<string, unknown>),
                                        type: value as
                                          | "flat"
                                          | "house"
                                          | "room"
                                          | undefined,
                                      } as Partial<ItemParams>,
                                    }
                                  : prev,
                              );
                            }}
                          />
                          <Input
                            status={
                              String(
                                (draft.params as RealEstateParams).address ?? "",
                              ) == ""
                                ? "warning"
                                : "validating"
                            }
                            style={{ width: "100%", maxWidth: "456px" }}
                            placeholder="Адрес"
                            value={String(
                              (draft.params as RealEstateParams).address ?? "",
                            )}
                            onChange={(e) =>
                              setParamString("address", e.target.value)
                            }
                          />
                          <Input
                            status={
                              String(
                                (draft.params as RealEstateParams).area ?? "",
                              ) == ""
                                ? "warning"
                                : "validating"
                            }
                            style={{ width: "100%", maxWidth: "456px" }}
                            placeholder="Площадь"
                            type="number"
                            value={
                              (draft.params as RealEstateParams).area === undefined
                                ? ""
                                : String((draft.params as RealEstateParams).area)
                            }
                            onChange={(e) => setParamNumber("area", e.target.value)}
                          />
                          <Input
                            status={
                              String(
                                (draft.params as RealEstateParams).floor ?? "",
                              ) == ""
                                ? "warning"
                                : "validating"
                            }
                            style={{ width: "100%", maxWidth: "456px" }}
                            placeholder="Этаж"
                            type="number"
                            value={
                              (draft.params as RealEstateParams).floor === undefined
                                ? ""
                                : String((draft.params as RealEstateParams).floor)
                            }
                            onChange={(e) =>
                              setParamNumber("floor", e.target.value)
                            }
                          />
                        </Flex>
  )
}