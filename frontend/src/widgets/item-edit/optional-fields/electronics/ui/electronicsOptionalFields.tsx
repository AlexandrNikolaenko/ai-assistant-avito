import type { DraftState, ElectronicsParams, ItemParams } from "@/shared/types/items";
import { Flex, Input, Select } from "antd";

export default function ElectronicsOptionalFields({
  draft,
  handleChange,
  setDraft,
  setParamString,
}: {
  draft: DraftState,
  handleChange: () => void,
  setDraft: React.Dispatch<React.SetStateAction<DraftState | null>>,
  setParamString: (key: string, value: string) => void
}) {

  return (
    <Flex
                      vertical
                      gap={8}
                      style={{ width: "100%", alignItems: "start" }}
                    >
                      <Select
                        status={
                          String(
                            (draft.params as ElectronicsParams).type ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{
                          width: "100%",
                          maxWidth: "456px",
                          textAlign: "left",
                        }}
                        placeholder="Тип"
                        value={(draft.params as ElectronicsParams).type ?? ""}
                        options={[
                          { value: "", label: "Не указано" },
                          { value: "phone", label: "Телефон" },
                          { value: "laptop", label: "Ноутбук" },
                          { value: "misc", label: "Другое" },
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
                                      | "phone"
                                      | "laptop"
                                      | "misc"
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
                            (draft.params as ElectronicsParams).brand ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Бренд"
                        value={String(
                          (draft.params as ElectronicsParams).brand ?? "",
                        )}
                        onChange={(e) =>
                          setParamString("brand", e.target.value)
                        }
                      />
                      <Input
                        status={
                          String(
                            (draft.params as ElectronicsParams).model ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Модель"
                        value={String(
                          (draft.params as ElectronicsParams).model ?? "",
                        )}
                        onChange={(e) =>
                          setParamString("model", e.target.value)
                        }
                      />
                      <Select
                        status={
                          String(
                            (draft.params as ElectronicsParams).condition ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{
                          width: "100%",
                          maxWidth: "456px",
                          textAlign: "left",
                        }}
                        placeholder="Состояние"
                        value={
                          (draft.params as ElectronicsParams).condition ?? ""
                        }
                        options={[
                          { value: "", label: "Не указано" },
                          { value: "new", label: "Новое" },
                          { value: "used", label: "Б/У" },
                        ]}
                        onChange={(value) => {
                          handleChange();
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  params: {
                                    ...(prev.params as Record<string, unknown>),
                                    condition: value as
                                      | "new"
                                      | "used"
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
                            (draft.params as ElectronicsParams).color ?? "",
                          ) == ""
                            ? "warning"
                            : "validating"
                        }
                        style={{ width: "100%", maxWidth: "456px" }}
                        placeholder="Цвет"
                        value={String(
                          (draft.params as ElectronicsParams).color ?? "",
                        )}
                        onChange={(e) =>
                          setParamString("color", e.target.value)
                        }
                      />
                    </Flex>
  )
}