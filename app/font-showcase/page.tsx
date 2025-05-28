import { Container } from "@/components/container"
import {
  H1,
  H2,
  H3,
  H4,
  P,
  Blockquote,
  Code,
  Lead,
  Large,
  Small,
  Subtle,
  PixelText,
  MonoText,
  AnimeText,
} from "@/components/ui/typography"

export default function FontShowcasePage() {
  return (
    <Container className="py-12">
      <div className="max-w-3xl mx-auto">
        <H1>Typography Showcase</H1>
        <Lead>This page demonstrates all the font options available in the Sonic Llamas Staking Hub.</Lead>

        <div className="mt-12 space-y-12">
          <section>
            <H2>Heading Fonts (Montserrat)</H2>
            <div className="mt-6 space-y-4">
              <H1>Heading 1 - The quick brown fox jumps over the lazy dog</H1>
              <H2>Heading 2 - The quick brown fox jumps over the lazy dog</H2>
              <H3>Heading 3 - The quick brown fox jumps over the lazy dog</H3>
              <H4>Heading 4 - The quick brown fox jumps over the lazy dog</H4>
            </div>
          </section>

          <section>
            <H2>Body Text (Inter)</H2>
            <div className="mt-6 space-y-4">
              <P>
                This is a paragraph using the Inter font. Inter is a variable font family designed for computer screens.
                It features a tall x-height to aid in readability of mixed-case and lower-case text.
              </P>
              <P>
                Several OpenType features are provided as well, like contextual alternates that adjust punctuation
                depending on the shape of surrounding glyphs, slashed zero for when you need to disambiguate "0" from
                "O", and tabular numbers.
              </P>
              <Large>This is large text for emphasis.</Large>
              <Small>This is small text for less important information.</Small>
              <Subtle>This is subtle text for secondary information.</Subtle>
            </div>
          </section>

          <section>
            <H2>Special Fonts</H2>
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <AnimeText className="text-2xl">Anime Ace Font - Great for titles and logos</AnimeText>
                <div className="mt-2">
                  <AnimeText>ABCDEFGHIJKLMNOPQRSTUVWXYZ</AnimeText>
                </div>
                <div className="mt-1">
                  <AnimeText>abcdefghijklmnopqrstuvwxyz</AnimeText>
                </div>
                <div className="mt-1">
                  <AnimeText>0123456789</AnimeText>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <PixelText className="text-2xl">Pixel Font - Perfect for gaming elements</PixelText>
                <div className="mt-2">
                  <PixelText>ABCDEFGHIJKLMNOPQRSTUVWXYZ</PixelText>
                </div>
                <div className="mt-1">
                  <PixelText>abcdefghijklmnopqrstuvwxyz</PixelText>
                </div>
                <div className="mt-1">
                  <PixelText>0123456789</PixelText>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <MonoText className="text-2xl">Roboto Mono - Ideal for code and addresses</MonoText>
                <div className="mt-2">
                  <MonoText>ABCDEFGHIJKLMNOPQRSTUVWXYZ</MonoText>
                </div>
                <div className="mt-1">
                  <MonoText>abcdefghijklmnopqrstuvwxyz</MonoText>
                </div>
                <div className="mt-1">
                  <MonoText>0123456789</MonoText>
                </div>
                <div className="mt-3">
                  <Code>const walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";</Code>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="font-serif text-2xl">Playfair Display - Elegant serif for special content</div>
                <div className="mt-2 font-serif">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
                <div className="mt-1 font-serif">abcdefghijklmnopqrstuvwxyz</div>
                <div className="mt-1 font-serif">0123456789</div>
                <div className="mt-3">
                  <Blockquote>
                    "The future of NFTs is not just about ownership, but about utility and community."
                  </Blockquote>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  )
}
