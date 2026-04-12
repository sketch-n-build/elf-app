import Link from "next/link";
import ElojeLogo from "./ui/ElojeLogo";

interface FooterProps {
  minimal?: boolean;
}

export default function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer style={{ background: "var(--ink)" }} className="py-6">
        <div className="section-wrap">
          <div
            className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6"
            style={{ borderTop: "1px solid rgba(168,230,216,0.07)" }}
          >
            <p className="text-[0.68rem]" style={{ color: "rgba(250,246,239,0.2)" }}>
              © 2025 Eleje Legacy. All rights reserved.
            </p>
            <p className="text-[0.68rem]" style={{ color: "rgba(250,246,239,0.2)" }}>
              Registered NGO · Anambra State, Nigeria
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer style={{ background: "var(--ink)" }} className="pt-[76px] pb-8">
      <div className="section-wrap">
        {/* Main Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12"
          style={{ borderBottom: "1px solid rgba(168,230,216,0.07)" }}
        >
          {/* Brand col */}
          <div>
            <ElojeLogo width={100} height={85} />
            <p
              className="mt-4 mb-[22px] max-w-[260px] leading-[1.8] text-[0.88rem]"
              style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontStyle: "italic",
                color: "rgba(250,246,239,0.38)",
              }}
            >
              "Every generation plants trees under whose shade they shall never sit — that is the meaning of legacy."
            </p>
            <div className="flex gap-[9px]">
              {["f", "in", "tw", "ig"].map((s) => (
                <div key={s} className="ft-soc">{s}</div>
              ))}
            </div>
          </div>

          {/* Organisation */}
          <div>
            <h5
              className="mb-4"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "var(--glow)",
              }}
            >
              Organisation
            </h5>
            <ul className="list-none flex flex-col gap-[10px]">
              {[
                { label: "About Us",       href: "/about" },
                { label: "Our Team",       href: "/about" },
                { label: "Annual Reports", href: "#" },
                { label: "Governance",     href: "#" },
                { label: "Careers",        href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[0.78rem] transition-colors duration-200 hover:text-[var(--pale)]"
                    style={{ color: "rgba(250,246,239,0.38)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <h5
              className="mb-4"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "var(--glow)",
              }}
            >
              Programmes
            </h5>
            <ul className="list-none flex flex-col gap-[10px]">
              {[
                "Mother & Child Care",
                "Legacy Learning",
                "Women in Growth",
                "Community Grants",
              ].map((label) => (
                <li key={label}>
                  <Link
                    href="/programmes"
                    className="text-[0.78rem] transition-colors duration-200 hover:text-[var(--pale)]"
                    style={{ color: "rgba(250,246,239,0.38)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h5
              className="mb-4"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "var(--glow)",
              }}
            >
              Get Involved
            </h5>
            <ul className="list-none flex flex-col gap-[10px]">
              {[
                { label: "Donate",             href: "/donate" },
                { label: "Join the Community", href: "/auth?tab=signup" },
                { label: "Volunteer",          href: "#" },
                { label: "Partner With Us",    href: "#" },
                { label: "Contact Us",         href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[0.78rem] transition-colors duration-200 hover:text-[var(--pale)]"
                    style={{ color: "rgba(250,246,239,0.38)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6">
          <p className="text-[0.68rem]" style={{ color: "rgba(250,246,239,0.2)" }}>
            © 2025 Eleje Legacy. All rights reserved.
          </p>
          <p className="text-[0.68rem]" style={{ color: "rgba(250,246,239,0.2)" }}>
            Registered NGO · Anambra State, Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}