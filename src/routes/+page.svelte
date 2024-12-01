<script lang="ts">
import ColorPicker from "svelte-awesome-color-picker";
import { ulid } from "ulidx";
import {
	type Palette,
	type PaletteKey,
	defaultPalette,
	getContrastRatio,
} from "../lib/color";

interface Highlight {
	id: string;
	name: string;
	foreground: PaletteKey;
	background: PaletteKey;
}

let highlightName = "";

const palette: Palette = { ...defaultPalette };

// 現在選択中の前景色と背景色
let selectedForeground: PaletteKey = "White";
let selectedBackground: PaletteKey = "Black";
let contrastRatio = "";

let highlights: Highlight[] = [];
let editingHighlight: Highlight | null = null; // 現在編集中のHighlight

const updateContrastRatio = (): void => {
	contrastRatio = getContrastRatio(
		palette[selectedForeground],
		palette[selectedBackground],
	).toFixed(2);

	contrastLog =
		(Math.log2(Number.parseFloat(contrastRatio)) / Math.log2(maxContrast)) *
		100;
};

const maxContrast = 21;
let contrastLog = 0;

updateContrastRatio();

const getBarColor = (ratio: number): string => {
	if (ratio >= 7) return "green";
	if (ratio >= 4.5) return "yellowgreen";
	if (ratio >= 3) return "orange";
	return "red";
};

const getContrastLabel = (ratio: number): string => {
	if (ratio >= 7) return "Good";
	if (ratio >= 4.5) return "Not Bad";
	if (ratio >= 3) return "Readable";
	return "Low Contrast";
};

const saveHighlight = (name: string): void => {
	if (name.trim() === "") {
		alert("Highlight name cannot be empty!");
		return;
	}

	if (editingHighlight) {
		// 編集中のHighlightを更新
		editingHighlight.name = name;
		editingHighlight.foreground = selectedForeground;
		editingHighlight.background = selectedBackground;
		editingHighlight = null; // 編集モード終了
	} else {
		// 新しいHighlightを保存
		highlights = [
			...highlights,
			{
				id: ulid(),
				name,
				foreground: selectedForeground,
				background: selectedBackground,
			},
		];
	}

	highlightName = ""; // 保存後にリセット
};

const editHighlight = (highlight: Highlight): void => {
	editingHighlight = { ...highlight };
	highlightName = highlight.name;
	selectedForeground = highlight.foreground;
	selectedBackground = highlight.background;
};

const deleteHighlight = (id: string): void => {
	highlights = highlights.filter((highlight) => highlight.id !== id);
};
</script>

<div>
  <h1>Customizable Palette Tester</h1>
  <h2 class="text-xl text-bold mt-4">Edit Palette</h2>
  <div class="flex flex-col gap-4">
    <div class="palette-table">
      {#each Object.keys(palette) as colorName (colorName)}
        <label class="text-right" for="palette-{colorName}">{colorName}:</label>
        <div>
          <label>
            <input
              type="radio"
              name="foreground"
              value={colorName}
              bind:group={selectedForeground}
              on:change={updateContrastRatio}
            />
            Foreground
          </label>
          <label>
            <input
              type="radio"
              name="background"
              value={colorName}
              bind:group={selectedBackground}
              on:change={updateContrastRatio}
            />
            Background
          </label>
        </div>
        <div>
          <ColorPicker
            label="Pick a color"
            name="palette-{colorName}"
            hex={palette[colorName as PaletteKey]}
            on:input={({ detail }) => {
              if (detail.hex) {
                palette[colorName as PaletteKey] = detail.hex;
                updateContrastRatio();
              }
            }}
          />
        </div>
      {/each}
    </div>

    <h2 class="text-xl text-bold mt-4">Edit Highlight</h2>
    <div class="highlight-table">
      <div
        class="preview-box"
        style="background-color: {palette[selectedBackground]}; color: {palette[
          selectedForeground
        ]};"
      >
        Sample Text
      </div>
      <div>
        <div>Contrast Ratio: {contrastRatio} - {getContrastLabel(parseFloat(contrastRatio))}</div>
        <div class="contrast-container">
          <!-- コントラスト比の視覚的表現 -->
          <div class="contrast-bar">
            <div class="contrast-bar-fill"
              style="
                        width: {contrastLog}%;
                        background-color: {getBarColor(parseFloat(contrastRatio))};">
            </div>
          </div>
          <span class="contrast-label contrast-label-readable">Readable</span>
          <span class="contrast-label contrast-label-notbad">Not Bad</span>
          <span class="contrast-label contrast-label-good">Good</span>
        </div>
      </div>
    </div>

    <div>
      <label for="highlight-name">Name:</label>
      <input
        type="text"
        name="highlight-name"
        placeholder="Highlight name"
        bind:value={highlightName}
      />
      <button on:click={() => saveHighlight(highlightName)}>
        {editingHighlight ? "Update Highlight" : "Save Highlight"}
      </button>
    </div>

    <h2 class="text-xl text-bold mt-4">Saved Highlights</h2>
    <div>
      {#each highlights as highlight (highlight.id)}
        <div
          class="highlight-item"
          style="background-color: {palette[
            highlight.background
          ]}; color: {palette[highlight.foreground]};"
        >
          <span>{highlight.name}</span>
          <div class="highlight-actions">
            <button on:click={() => editHighlight(highlight)}>Edit</button>
            <button on:click={() => deleteHighlight(highlight.id)}
              >Delete</button
            >
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .palette-table {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, auto) 1fr;
    column-gap: 5px;
    row-gap: 5px;
    align-items: center;
    width: fit-content;
  }

  .preview-box {
    padding: 1rem 2rem;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
  }

  .highlight-table {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, 1fr);
    column-gap: 20px;
  }

  .contrast-container {
    display: grid;
    grid-template-columns: repeat(100, 1fr);
  }

  .contrast-bar {
    grid-row: 1;
    grid-column: 1 / 101;
    width: 100%;
    height: 20px;
    background-color: #ddd;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .contrast-bar-fill {
    height: 100%;
    width: 0;
    background-color: green;
    transition:
      width 0.5s,
      background-color 0.5s;
  }

  .contrast-label {
    text-align: left;
    border-left: 1px dashed #666;
    padding-left: 2px;
  }

  .contrast-label-readable {
    grid-column: 36 / 49;
  }
  .contrast-label-notbad {
    grid-column: 49 / 64;
  }
  .contrast-label-good {
    grid-column: 64 / 100;
  }
</style>
