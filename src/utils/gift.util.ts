import { giftConfig } from "@/components/refine/screens/gift-lucky-wheel.screen";

const BAG_KEY = 'giftLuckyWheelBag';
const BATCH_SIZE = 300;

function buildBag() {
  const bag: string[] = [];
  // Thêm quà theo tỉ lệ từ giftConfig
  giftConfig.forEach((config) => {
    const quantity = Math.floor(BATCH_SIZE * config.gift.ratio / 100);
    bag.push(...Array(quantity).fill(config.gift.code));
  });
  return secureShuffle(bag);
}

function secureShuffle(arr: string[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32 * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getOrCreateBag() {
  const saved = localStorage.getItem(BAG_KEY);
  if (saved) {
    const { batch, index } = JSON.parse(saved);
    if (index < batch.length) return { batch, index };
  }
  // Hết hoặc không có → tạo mới
  const batch = buildBag();
  localStorage.setItem(BAG_KEY, JSON.stringify({ batch, index: 0 }));
  return { batch, index: 0 };
}

export function drawGift(): string {
  const { batch, index } = getOrCreateBag();
  const gift = batch[index];
  const nextIndex = index + 1;

  // Cập nhật lại localStorage
  if (nextIndex >= batch.length) {
    // Hết batch → tạo mới
    const newBatch = buildBag();
    localStorage.setItem(BAG_KEY, JSON.stringify({ batch: newBatch, index: 0 }));
  } else {
    localStorage.setItem(BAG_KEY, JSON.stringify({ batch, index: nextIndex }));
  }

  return gift;
}
