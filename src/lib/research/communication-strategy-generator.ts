import type { CommunicationStrategy, NormalizedProfile, ProfileScore } from "./types";

export function generateCommunicationStrategy(
  profile: NormalizedProfile,
  score: ProfileScore,
): CommunicationStrategy {
  const sourceAngle =
    profile.evidenceCount > 1
      ? "birden fazla acik web kanitinda gorunurluk"
      : "acik web uzerindeki profesyonel gorunurluk";
  const firstTouchAngle =
    score.finalScore >= 90
      ? `${sourceAngle} ve E4N kitlesine yuksek uyum nedeniyle kisilestirilmis davet`
      : score.finalScore >= 75
        ? `${sourceAngle} nedeniyle once sicak tanisma ve ek arastirma`
        : "veri zenginlestirme tamamlanmadan direkt davet onerilmez";

  return {
    firstTouchAngle,
    firstMessageDraft: `Merhaba, ${profile.normalizedName} hakkinda ${sourceAngle} dikkatimi cekti. E4N'de secici bir is insanlari agi icin finans, yatirim ve girisimcilik ekosistemindeki karar vericilerle tanisma gorusmeleri yapiyoruz. Uygun olursa once kisa bir tanisma ve karsilikli uygunluk degerlendirmesi yapmak isteriz.`,
    followUpPlan:
      score.finalScore >= 75
        ? "Ilk temastan 3-5 gun sonra, satis baskisi kurmadan ilgili etkinlik veya ortak ekosistem baglami uzerinden takip yap."
        : "Yeni kanit veya ortak baglanti bulunana kadar nurture listesinde tut.",
    riskNotes: "V1'de otomatik mesaj gonderilmez. Tum outbound iletisim insan onayina baglidir.",
  };
}
