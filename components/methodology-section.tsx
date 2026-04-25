"use client"

interface MethodologySectionProps {
  onNavigate?: (view: string) => void
}

export function MethodologySection({ onNavigate }: MethodologySectionProps) {
  return (
    <section className="prose-content mx-auto max-w-2xl px-6 py-8">
      <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Data &amp; Methods
      </h2>

      <div className="mt-8 flex flex-col gap-6 leading-relaxed text-muted-foreground">
        <p>
          The first 140 cases presented here were found over the course of eight
          years through in-person, site-visits to historical archives containing
          the papers and clippings from civil rights organizations and through
          in-depth key word searching of online newspaper databases.
        </p>
        <p>
          Our goal was to find over 100 cases and then make the data available
          for two reasons &ndash; to educate the public about this history and
          to crowdsource for more cases.
        </p>
        <p>
          We know these cases have been under-reported by local papers,
          especially early-on in the movement; under-investigated by
          authorities, especially in places where there were strong connections
          between segregationist forces, the KKK and police forces; and, largely
          ignored by the public.
        </p>
        <p>
          Thus, formal, historical documentation of the cases is limited, and
          there are more cases out there.
        </p>
        <p className="font-medium italic text-foreground">
          We need your help finding more cases.
        </p>
        <p>
          Your memories and stories are invaluable to us. Please{" "}
          <button
            onClick={() => onNavigate?.("submit")}
            className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
          >
            submit a case
          </button>
          ,{" "}
          <button
            onClick={() => onNavigate?.("contact")}
            className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
          >
            contact us using our website form
          </button>
          , or email us at{" "}
          <a
            href="mailto:contact@blackchurchburning.org"
            className="underline underline-offset-2 decoration-primary/60 hover:decoration-primary transition-colors text-foreground"
          >
            contact@blackchurchburning.org
          </a>{" "}
          if:
        </p>
        <ul className="flex flex-col gap-2">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              your congregation was burned or bombed, or if someone attempted to
              burn or bomb your congregation
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              you remember from childhood something about a church burning or
              bombing in your local area
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              you know a local story about the bombing or burning of a Black
              church
            </span>
          </li>
        </ul>

        <div className="h-px w-full bg-border" aria-hidden="true" />

        {/* Data Limitations */}
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground">
            Data Limitations
          </h3>
          <p className="mt-3">
            The historical sources these cases have been found in are limited in
            information, details, accuracy and scope. A lot of the cases have
            come from files of clippings of local newspaper articles on the day
            of or after the incident.
          </p>
          <p className="mt-3">
            Sometimes the dates and details may be inaccurate. Sometimes the
            article did not mention the name of the congregation. We&apos;ve
            tried to triangulate the details as much as possible for accuracy
            but errors and gaps in our knowledge remain.
          </p>
          <p className="mt-3">
            For this reason, we invite you to submit corrections if you have
            better information.
          </p>
          <p className="mt-3">
            Furthermore, we recognize that sometimes church buildings catch on
            fire accidentally and without malicious intent and that some of
            these cases may just have been accidents. But given the fact that
            investigations rarely happened and if they did the results were
            never publicized, and given the context from which these cases were
            found &ndash; clipped in civil rights organizations&apos; folders
            labeled{" "}
            <em>Violence and Intimidation</em> or{" "}
            <em>Church Burnings</em> &ndash; we are comfortable including all
            cases with the knowledge that there may be some random errors in the
            data.
          </p>
        </div>

        <div className="h-px w-full bg-border" aria-hidden="true" />

        {/* Scope */}
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground">
            Scope
          </h3>
          <p className="mt-3">
            The current scope of the project focuses on the American South
            during the Civil Rights Era (1954&ndash;1970), though we recognize
            that attacks on Black churches occurred outside this geography and
            time period. Future phases of the project may expand to include:
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Churches outside the American South</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Incidents before 1954 and after 1970</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Other forms of racially motivated attacks on houses of worship
              </span>
            </li>
          </ul>
          <p className="mt-4">
            We also acknowledge that the historical record is incomplete. Many
            incidents were never reported, recorded, or preserved. This project
            is an ongoing effort, and the database will continue to grow as new
            information comes to light.
          </p>
        </div>

        <div className="h-px w-full bg-border" aria-hidden="true" />

        {/* Archival Sources */}
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground">
            Archival Sources
          </h3>
          <ul className="mt-4 flex flex-col gap-5">
            <li>
              <p className="font-medium text-foreground">
                Birmingham Public Library, Department of Archives and
                Manuscripts (Birmingham, AL).
              </p>
              <p className="mt-1">
                Civil rights collections, including{" "}
                <em>Birmingham Archives Database of Bombings</em>,{" "}
                <em>Civil Rights Movement Scrapbooks</em> and the{" "}
                <em>
                  Sixteenth Street Baptist Church Bombing Investigation Files
                </em>
              </p>
            </li>
            <li>
              <p className="font-medium text-foreground">
                Congress of Racial Equality Records, Wisconsin Historical
                Society (Madison, WI).
              </p>
              <p className="mt-1">
                <em>Papers of the Congress of Racial Equality, 1941&ndash;1967</em>,
                and related collections held in the Archives Division of the
                Wisconsin Historical Society, including records of national,
                regional, and local CORE chapters.
              </p>
            </li>
            <li>
              <p className="font-medium text-foreground">
                Southern Regional Council Collection, Auburn Avenue Research
                Library on African American Culture and History (Atlanta, GA).
              </p>
              <p className="mt-1">
                <em>Southern Regional Council &ndash; Series 1: Clippings</em>{" "}
                and <em>Series 2: Publications</em>, documenting SRC&apos;s
                work on civil rights, race relations, and social change in the
                American South, 1940s&ndash;1970s.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
