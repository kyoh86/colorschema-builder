<script lang="ts">
    import ColorPicker  from "svelte-awesome-color-picker";

    let backgroundColor = "#000000";
    let foregroundColor = "#ffffff";

    let contrastRatio: string = "";

    // 色の相対輝度を計算
    function getLuminance(color: string): number {
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;

        const [R, G, B] = [r, g, b].map((v) =>
            v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        );

        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    // 2つの色のコントラスト比を計算
    function getContrastRatio(color1: string, color2: string): number {
        const luminance1 = getLuminance(color1);
        const luminance2 = getLuminance(color2);
        const brighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);

        return (brighter + 0.05) / (darker + 0.05);
    }

    // コントラスト比を更新
    const updateContrastRatio = (): void => {
        contrastRatio = getContrastRatio(backgroundColor, foregroundColor).toFixed(2);
    };

    // 初期コントラスト比を計算
    updateContrastRatio();
</script>

<style>
    .preview-box {
        width: 100%;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ccc;
        margin-top: 1rem;
    }
    .color-pickers {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
</style>

<div>
    <h1>Color Combination Tester</h1>

    <div class="color-pickers">
        <div>
            <label for="background">Background Color:</label>

            <ColorPicker
                hex="{backgroundColor}"
                on:input="{({detail}) => {
                    if (!detail.hex) return;
                    backgroundColor = detail.hex;
                    updateContrastRatio();
                }}"
            />
        </div>

        <div>
            <label for="foreground">Foreground Color:</label>
            <ColorPicker
                hex="{foregroundColor}"
                on:input="{({detail}) => {
                    if (!detail.hex) return;
                    foregroundColor = detail.hex;
                    updateContrastRatio();
                }}"
            />
        </div>
    </div>

    <div
        class="preview-box"
        style="background-color: {backgroundColor}; color: {foregroundColor};"
    >
        Sample Text
    </div>

    <p>Contrast Ratio: {contrastRatio}</p>
    <p>{parseFloat(contrastRatio) >= 4.5 ? "Accessible" : parseFloat(contrastRatio)>=2.5?"Readable" : "Not Accessible"}</p>
</div>
