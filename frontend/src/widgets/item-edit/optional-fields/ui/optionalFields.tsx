import type { DraftState, ItemParams, ItemCategory } from "@/shared/types/items";
import AutoOptionalFields from "../auto/ui/autoOptionalFields"
import ElectronicsOptionalFields from "../electronics/ui/electronicsOptionalFields"
import RealEstateOptionalFields from "../real-estate/ui/realEstateOptionalFields"

export default function OptionalFields ({
  draft,
  handleChange,
  setDraft, 
  category
}: {draft: DraftState,
  handleChange: () => void,
  setDraft: React.Dispatch<React.SetStateAction<DraftState | null>>,
  category?: ItemCategory}) {
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
  if (category == 'auto') return <AutoOptionalFields draft={draft} handleChange={handleChange} setDraft={setDraft} setParamNumber={setParamNumber} setParamString={setParamString}/>
  else if (category == 'electronics') return <ElectronicsOptionalFields draft={draft} handleChange={handleChange} setDraft={setDraft} setParamString={setParamString}/>
  else if (category == 'real_estate') return <RealEstateOptionalFields draft={draft} handleChange={handleChange} setDraft={setDraft} setParamNumber={setParamNumber} setParamString={setParamString}/>
  else return
}