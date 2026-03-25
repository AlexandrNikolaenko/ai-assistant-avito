import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Divider,
  Flex,
  Input,
  Layout,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getItem, updateItem } from "../api/itemsApi";
import type {
  AutoParams,
  ElectronicsParams,
  ItemCategory,
  ItemParams,
  RealEstateParams,
} from "../types/items";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "../constants/categories";
import { aiImproveDescription, aiPredictMarketPrice } from "../services/adsAi";
import { Content } from "antd/es/layout/layout";

type DraftState = {
  category: ItemCategory;
  title: string;
  description: string;
  price: number;
  params: Partial<ItemParams>;
};

const storageKeyForDraft = (id: number) => `adsDraft:${id}`;
const { Title, Text } = Typography;
const { TextArea } = Input;

function toSafeNumber(raw: number | null): number {
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
}

export function AdsEditPage() {
  const navigate = useNavigate();
  const params = useParams();

  const id = useMemo(() => {
    const raw = params.id;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.id]);

  const draftAbortRef = useRef<AbortController | null>(null);

  const [draft, setDraft] = useState<DraftState | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState<"description" | "price" | null>(
    null,
  );
  const [aiError, setAiError] = useState<string | null>(null);
  const [proposedDescription, setProposedDescription] = useState<string | null>(
    null,
  );
  const [proposedPrice, setProposedPrice] = useState<number | null>(null);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [focusedFields, setFocusedFields] = useState<string[]>([]);
  // const [isDraftInit, setIsDraftInit] = useState<boolean>(false);

  const handleFocusedField = (field: string) => {
    if (focusedFields.includes(field))
      setFocusedFields(focusedFields.filter((elem) => elem != field));
    else setFocusedFields(focusedFields.concat([field]));
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item-edit", id],
    queryFn: () => {
      if (id === null) throw new Error("Неверный id объявления");
      return getItem(id);
    },
    enabled: id !== null,
  });

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

  useEffect(() => {
    if (id === null || data === undefined) return;

    const key = storageKeyForDraft(id);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as DraftState;
        if (parsed && typeof parsed === "object") {
          setDraft(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    setDraft({
      category: data.category,
      title: data.title,
      description: data.description ?? "",
      price: toSafeNumber(data.price),
      params: data.params as Partial<ItemParams>,
    });
  }, [data, id]);

  const handleChange = () => {
    if (id === null || draft === null) return;
    const key = storageKeyForDraft(id);
    // console.log(data, draft);

    try {
      window.localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    return () => {
      draftAbortRef.current?.abort();
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (id === null || draft === null)
        throw new Error("Нет данных для сохранения");

      const payload = {
        category: draft.category,
        title: draft.title,
        description: draft.description.trim() ? draft.description : undefined,
        price: draft.price,
        params: draft.params,
      };

      return updateItem(id, payload);
    },
    onSuccess: (result) => {
      if (id === null) return;

      if (!result.success) {
        setDraftError(result.error);
        return;
      }

      try {
        console.log(storageKeyForDraft(id));
        window.localStorage.removeItem(storageKeyForDraft(id));
      } catch {
        console.log("here");
        // ignore
      }
      navigate(`/ads/${id}`);
    },
  });

  const startAiDescription = async () => {
    if (id === null || draft === null) return;
    setAiError(null);
    setDraftError(null);
    setProposedDescription(null);
    setProposedPrice(null);

    if (!draft.title.trim()) {
      setDraftError("Название объявления обязательно");
      return;
    }

    if (!draft.category) {
      setDraftError("Категория объявления обязательна");
      return;
    }

    draftAbortRef.current?.abort();
    const controller = new AbortController();
    draftAbortRef.current = controller;
    setAiLoading("description");

    try {
      const raw = await aiImproveDescription({
        category: draft.category,
        title: draft.title,
        description: draft.description,
        params: draft.params as
          | AutoParams
          | RealEstateParams
          | ElectronicsParams,
        signal: controller.signal,
      });

      setProposedDescription(raw);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Ошибка генерации описания");
    } finally {
      setAiLoading(null);
    }
  };

  const startAiPrice = async () => {
    if (id === null || draft === null) return;
    setAiError(null);
    setDraftError(null);
    setProposedDescription(null);
    setProposedPrice(null);

    if (!draft.title.trim()) {
      setDraftError("Название объявления обязательно");
      return;
    }

    draftAbortRef.current?.abort();
    const controller = new AbortController();
    draftAbortRef.current = controller;
    setAiLoading("price");

    try {
      const price = await aiPredictMarketPrice({
        category: draft.category,
        title: draft.title,
        description: draft.description,
        params: draft.params as
          | AutoParams
          | RealEstateParams
          | ElectronicsParams,
        signal: controller.signal,
      });

      setProposedPrice(price);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Ошибка генерации цены");
    } finally {
      setAiLoading(null);
    }
  };

  const setParamString = (key: string, value: string) => {
    handleChange();
    setDraft((prev) => {
      if (!prev) return prev;
      const nextParams = {
        ...(prev.params as Record<string, unknown>),
        [key]: value,
      };
      return { ...prev, params: nextParams as Partial<ItemParams> };
    });
  };

  const setParamNumber = (key: string, raw: string) => {
    const value = raw.trim() === "" ? undefined : Number(raw);
    handleChange();
    setDraft((prev) => {
      if (!prev) return prev;
      const nextParams = {
        ...(prev.params as Record<string, unknown>),
        [key]: value,
      };
      return { ...prev, params: nextParams as Partial<ItemParams> };
    });
  };

  if (id === null)
    return <Alert type="error" message="Неверный id объявления" />;

  return (
    <Layout
      style={{
        padding: "12px 32px",
        backgroundColor: "#f7f5f8",
        minHeight: "100vh",
      }}
    >
      <Content>
        <Flex vertical gap={16} style={{ width: "100%" }}>
          {isLoading || draft === null ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "32px 0",
              }}
            >
              <Spin size="large" />
            </div>
          ) : isError ? (
            <Alert
              type="error"
              message={error instanceof Error ? error.message : "Ошибка загрузки"}
            />
          ) : (
            <>
              {draftError ? <Alert type="error" message={draftError} /> : null}
              {aiError ? <Alert type="error" message={aiError} /> : null}

              <Flex
                vertical
                gap={18}
                style={{ width: "100%", alignItems: "start", display: "flex" }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Редактирование объявления
                </Title>

                <Flex
                  vertical
                  gap={8}
                  style={{ width: "100%", alignItems: "start" }}
                >
                  <Text>Категория</Text>
                  <Select
                    onFocus={() => handleFocusedField("category")}
                    onBlur={() => handleFocusedField("category")}
                    style={{ width: "256px", textAlign: "left" }}
                    value={draft.category}
                    status={
                      (draft.category.length == 0 || !draft.category) &&
                      !focusedFields.includes("title")
                        ? "error"
                        : ""
                    }
                    options={CATEGORY_OPTIONS.map((category) => ({
                      value: category,
                      label: CATEGORY_LABELS[category],
                    }))}
                    onChange={(value) => {
                      const next = value as ItemCategory;
                      checkError("category", value);
                      handleChange();
                      setDraft((prev) =>
                        prev ? { ...prev, category: next, params: {} } : prev,
                      );
                    }}
                  />
                  {((draft.category.length == 0 || !draft.category) &&
                    !focusedFields.includes("title")) ?? (
                    <Text style={{ color: "#EC221F" }}>
                      Категория должна быть выбрана
                    </Text>
                  )}
                </Flex>

                <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

                <Flex
                  vertical
                  gap={8}
                  style={{ width: "100%", alignItems: "start" }}
                >
                  <Text>Название</Text>
                  <Input
                    onFocus={() => handleFocusedField("title")}
                    onBlur={() => handleFocusedField("title")}
                    style={{ width: "100%", maxWidth: "456px" }}
                    status={
                      (draft.title.length == 0 || !draft.title) &&
                      !focusedFields.includes("title")
                        ? "error"
                        : ""
                    }
                    value={draft.title}
                    onChange={(e) => {
                      const next = e.target.value;
                      checkError("title", e.target.value);
                      handleChange();
                      setDraft((prev) =>
                        prev ? { ...prev, title: next } : prev,
                      );
                    }}
                  />
                  {(draft.title.length == 0 || !draft.title) &&
                    !focusedFields.includes("title") && (
                      <Text style={{ color: "#EC221F" }}>
                        Название должно быть заполнено
                      </Text>
                    )}
                </Flex>

                <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

                <Flex
                  gap={12}
                  align="end"
                  style={{ width: "100%", alignItems: "end", maxWidth: "675px" }}
                >
                  <Flex
                    vertical
                    gap={8}
                    style={{ width: "100%", alignItems: "start" }}
                  >
                    <Text>Цена</Text>
                    <Input
                      onFocus={() => handleFocusedField("price")}
                      onBlur={() => handleFocusedField("price")}
                      status={
                        (draft.price == 0 || !draft.price) &&
                        !focusedFields.includes("price")
                          ? "error"
                          : ""
                      }
                      style={{ width: "100%", maxWidth: "456px" }}
                      value={String(draft.price)}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        checkError("price", e.target.value);
                        setProposedPrice(null);
                        handleChange();
                        setDraft((prev) =>
                          prev ? { ...prev, price: next } : prev,
                        );
                      }}
                    />
                    {(draft.price == 0 || !draft.price) &&
                      !focusedFields.includes("price") && (
                        <Text style={{ color: "#EC221F" }}>
                          Цена должна быть указана
                        </Text>
                      )}
                  </Flex>
                  <Button
                    variant="solid"
                    color="gold"
                    style={{ backgroundColor: "#F9F1E6", color: "#FFA940" }}
                    onClick={startAiPrice}
                    disabled={aiLoading !== null}
                  >
                    <img src="/BulbIcon.svg" />
                    {aiLoading === "price" ? "Оценка..." : "Узнать рыночную цену"}
                  </Button>
                </Flex>

                <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

                <div
                  style={{
                    width: "100%",
                    alignItems: "start",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Title style={{ margin: 0 }} level={5}>
                    Характеристики
                  </Title>

                  {draft.category === "auto" ? (
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
                        onChange={(e) => setParamString("brand", e.target.value)}
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
                        onChange={(e) => setParamString("model", e.target.value)}
                      />
                      <Input
                        status={
                          String(
                            (draft.params as AutoParams).yearOfManufacture ?? "",
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
                          String((draft.params as AutoParams).mileage ?? "") == ""
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
                  ) : null}

                  {draft.category === "real_estate" ? (
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
                          String((draft.params as RealEstateParams).area ?? "") ==
                          ""
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
                        onChange={(e) => setParamNumber("floor", e.target.value)}
                      />
                    </Flex>
                  ) : null}

                  {draft.category === "electronics" ? (
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
                        onChange={(e) => setParamString("brand", e.target.value)}
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
                        onChange={(e) => setParamString("model", e.target.value)}
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
                        onChange={(e) => setParamString("color", e.target.value)}
                      />
                    </Flex>
                  ) : null}
                </div>

                <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

                <Flex
                  vertical
                  gap={8}
                  style={{ width: "100%", maxWidth: "962px", alignItems: "end" }}
                >
                  <Text style={{ width: "100%", textAlign: "left" }}>
                    Описание
                  </Text>
                  <TextArea
                    style={{ width: "100%", maxWidth: "962px" }}
                    rows={4}
                    value={draft.description}
                    status={
                      draft.description.length > 1000
                        ? "error"
                        : String(draft.description ?? "") == ""
                          ? "warning"
                          : "validating"
                    }
                    onChange={(e) => {
                      const next = e.target.value;
                      checkError("description", e.target.value);
                      setProposedDescription(null);
                      handleChange();
                      setDraft((prev) =>
                        prev ? { ...prev, description: next } : prev,
                      );
                    }}
                  />

                  <Flex
                    style={{
                      width: "100%",
                      alignItems: "start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      variant="solid"
                      color="gold"
                      style={{ backgroundColor: "#F9F1E6", color: "#FFA940" }}
                      onClick={startAiDescription}
                      disabled={aiLoading !== null}
                    >
                      <img src="/BulbIcon.svg" />
                      {aiLoading === "description"
                        ? "Генерация..."
                        : "Улучшить описание"}
                    </Button>
                    <Text
                      type={
                        draft.description.length > 1000 ? "danger" : undefined
                      }
                    >
                      {draft.description.length}/1000
                    </Text>
                  </Flex>
                </Flex>

                {proposedDescription ? (
                  <Alert
                    type="info"
                    style={{
                      textAlign: "left",
                    }}
                    message="AI предложило описание"
                    description={
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%" }}
                      >
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {proposedDescription}
                        </div>
                        <Button
                          type="primary"
                          onClick={() => {
                            handleChange();
                            setDraft((prev) =>
                              prev
                                ? { ...prev, description: proposedDescription }
                                : prev,
                            );
                            setProposedDescription(null);
                          }}
                        >
                          Применить
                        </Button>
                      </Space>
                    }
                  />
                ) : null}

                {proposedPrice !== null ? (
                  <Alert
                    type="info"
                    style={{
                      textAlign: "left",
                    }}
                    message={`AI предложило цену: ${proposedPrice.toLocaleString("ru-RU")} ₽`}
                    description={
                      <Button
                        type="primary"
                        onClick={() => {
                          handleChange();
                          setDraft((prev) =>
                            prev ? { ...prev, price: proposedPrice } : prev,
                          );
                          setProposedPrice(null);
                        }}
                      >
                        Применить цену
                      </Button>
                    }
                  />
                ) : null}

                <Space size={12} style={{ marginTop: 4 }}>
                  <Button
                    type="primary"
                    loading={saveMutation.isPending}
                    disabled={saveMutation.isPending || errorFields.length > 0}
                    onClick={() => {
                      setDraftError(null);
                      if (draft.title.trim().length === 0) {
                        setDraftError("Название объявления обязательно");
                        return;
                      }
                      if (!Number.isFinite(draft.price) || draft.price < 0) {
                        setDraftError("Цена должна быть числом >= 0");
                        return;
                      }
                      saveMutation.mutate();
                    }}
                  >
                    {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
                  </Button>

                  <Button
                    disabled={saveMutation.isPending}
                    onClick={() => {
                      try {
                        window.localStorage.removeItem(storageKeyForDraft(id));
                      } catch {
                        // ignore
                      }
                      navigate(`/ads/${id}`);
                    }}
                  >
                    Отменить
                  </Button>
                </Space>
              </Flex>
            </>
          )}
        </Flex>
      </Content>
    </Layout>
  );
}
