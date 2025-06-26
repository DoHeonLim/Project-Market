/**
 * File Name : components/search/filters/GameTypeFilter
 * Description : 검색 필터 - 게임 타입 필터 컴포넌트
 * Author : 임도헌
 *
 * History
 * Date        Author   Status    Description
 * 2025.06.18  임도헌   Created   게임 타입 필터 분리
 */

"use client";

interface GameTypeFilterProps {
  value?: string;
  onChange: (value: string) => void;
}

const GAME_TYPES = [
  { value: "", label: "전체" },
  { value: "BOARD_GAME", label: "보드게임" },
  { value: "TRPG", label: "TRPG" },
  { value: "CARD_GAME", label: "카드게임" },
];

export default function GameTypeFilter({
  value,
  onChange,
}: GameTypeFilterProps) {
  return (
    <div>
      <label className="block text-sm mb-1 dark:text-white">게임 타입</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1 border dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 dark:text-white"
      >
        {GAME_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}
