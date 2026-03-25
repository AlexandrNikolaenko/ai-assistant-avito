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
import { getItem, updateItem } from "@/entities/item/api/itemsApi";
import type {
  AutoParams,
  ElectronicsParams,
  ItemCategory,
  ItemParams,
  RealEstateParams,
} from "@/shared/types/items";
import {
  aiImproveDescription,
  aiPredictMarketPrice,
} from "@/features/ads/ai-generate/api/adsAi";
import { Content } from "antd/es/layout/layout";
// import RequiredFields from "@/widgets/item-edit/required-fields/ui/requiredFields";
import OptionalFields from "@/widgets/item-edit/optional-fields/ui/optionalFields";
import useCheckError from "@/features/ads/edit-ad/hooks/useCheckErrors";
import WhiteTooltip from "@/shared/ui/tooltip/tooltip";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/shared/constants/categories";

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
  const [textDescButton, setTextDescButton] = useState<'Придумать описание' | 'Улучшить описание' | 'Выполняется запрос' | 'Повторить запрос'>('Придумать описание');
  const [textPriceButton, setTextPriceButton] = useState<'Узнать рыночную цену' | 'Выполняется запрос' | 'Повторить запрос'>('Узнать рыночную цену')
  const [proposedPrice, setProposedPrice] = useState<number | null>(null);
  const {errorFields, checkError} = useCheckError();
  const [focusedFields, setFocusedFields] = useState<string[]>([]);
    
  const handleFocusedField = (field: string) => {
    if (focusedFields.includes(field))  setFocusedFields(focusedFields.filter((elem) => elem != field));
    else setFocusedFields(focusedFields.concat([field]));
  };

  useEffect(() => {
    if (textDescButton == 'Придумать описание' &&  draft?.description) setTextDescButton('Улучшить описание');
  })
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item-edit", id],
    queryFn: () => {
      if (id === null) throw new Error("Неверный id объявления");
      return getItem(id);
    },
    enabled: id !== null,
  });



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
    setProposedDescription(null);
    setProposedPrice(null);

    if (!draft.title.trim()) {
      checkError("title", draft.title.trim());
      return;
    }

    if (!draft.category) {
      checkError("category", draft.category);
      return;
    }

    draftAbortRef.current?.abort();
    const controller = new AbortController();
    draftAbortRef.current = controller;
    setAiLoading("description");
    setTextDescButton('Выполняется запрос');

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
      setTextDescButton('Повторить запрос')
    }
  };

  const startAiPrice = async () => {
    if (id === null || draft === null) return;
    setAiError(null);
    setProposedDescription(null);
    setProposedPrice(null);

    if (!draft.title.trim()) {
      checkError("title", draft.title.trim());
      return;
    }

    draftAbortRef.current?.abort();
    const controller = new AbortController();
    draftAbortRef.current = controller;
    setAiLoading("price");
    setTextPriceButton('Выполняется запрос')

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
      setTextPriceButton('Повторить запрос')
    }
  };

  if (id === null)
    return <Alert type="error" message="Неверный id объявления" />;

  return (
    <Layout
      style={{
        padding: "12px 32px",
        backgroundColor: "#ffffff",
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
              description={
                error instanceof Error ? error.message : "Ошибка загрузки"
              }
            />
          ) : (
            <>
              {draftError ? <Alert type="error" description={draftError} /> : null}
              {aiError ? <Alert type="error" description={aiError} /> : null}

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
                  style={{
                    width: "100%",
                    alignItems: "end",
                    maxWidth: "675px",
                  }}
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
                  <WhiteTooltip open={!!proposedPrice} object={
                    <Button
                      variant="solid"
                      color="gold"
                      style={{ backgroundColor: "#F9F1E6", color: "#FFA940", width: '195px' }}
                      onClick={startAiPrice}
                      loading={aiLoading !== null}
                    >
                      {
                          typeof aiLoading != 'string' && (textPriceButton == 'Повторить запрос' ? <img src="/RedoIcon.svg" /> : <img src="/BulbIcon.svg" />)
                        }
                      {textPriceButton}
                    </Button>
                  }>
                    <Flex
                      vertical
                      gap={8}
                      style={{ width: "100%" }}
                    >
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {proposedPrice}
                      </div>
                      <Flex gap={10}>
                        <Button
                          style={{outline: 'none'}}
                          type="primary"
                          onClick={() => {
                            handleChange();
                            setDraft((prev) =>
                              prev && typeof proposedPrice === 'number' ? { ...prev, price: proposedPrice } : prev,
                            );
                            setProposedPrice(null);
                            if (proposedPrice) checkError('price', proposedPrice)
                          }}
                        >
                          Применить
                        </Button>
                        <Button onClick={() => setProposedPrice(null)}>
                          Отменить
                        </Button>
                      </Flex>
                    </Flex>
                  </WhiteTooltip>
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

                  <OptionalFields
                    draft={draft}
                    setDraft={setDraft}
                    handleChange={handleChange}
                    category={data?.category}
                  />
                </div>

                <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

                <Flex
                  vertical
                  gap={8}
                  style={{
                    width: "100%",
                    maxWidth: "962px",
                    alignItems: "end",
                  }}
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
                    <WhiteTooltip object={
                      <Button
                        loading={aiLoading !== null}
                        variant="solid"
                        color="gold"
                        style={{ backgroundColor: "#F9F1E6", color: "#FFA940", border: 'none', outline: 'none', width: '195px' }}
                        onClick={startAiDescription}
                        disabled={aiLoading !== null}
                      >
                        {
                          typeof aiLoading != 'string' && (textDescButton == 'Повторить запрос' ? <img src="/RedoIcon.svg" /> : <img src="/BulbIcon.svg" />)
                        }
                        {textDescButton}
                      </Button>} open={!!proposedDescription}>
                      <Flex
                        vertical
                        gap={8}
                        style={{ width: "100%" }}
                      >
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {proposedDescription}
                        </div>
                        <Flex gap={10}>
                          <Button
                            style={{outline: 'none'}}
                            type="primary"
                            onClick={() => {
                              handleChange();
                              setDraft((prev) =>
                                prev && typeof proposedDescription === 'string' ? { ...prev, description: proposedDescription } : prev,
                              );
                              setProposedDescription(null);
                              checkError('description', String(proposedDescription))
                            }}
                          >
                            Применить
                          </Button>
                          <Button onClick={() => setProposedDescription(null)}>
                            Отменить
                          </Button>
                        </Flex>
                      </Flex>
                    </WhiteTooltip>
                    <Text
                      type={
                        draft.description.length > 1000 ? "danger" : undefined
                      }
                    >
                      {draft.description.length}/1000
                    </Text>
                  </Flex>
                </Flex>

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
                        checkError('title', draft.title.trim())
                        return;
                      }
                      if (!Number.isFinite(draft.price) || draft.price < 0) {
                        checkError('preice', draft.price)
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
