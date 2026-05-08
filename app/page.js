"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import { lexingtonData } from "@/data/lexingtonData";

export default function Home() {
  const [activeTab, setActiveTab] = useState("menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [openItemKey, setOpenItemKey] = useState(null);

  const activeData = lexingtonData[activeTab];

  const filteredSections = useMemo(() => {
    if (activeTab === "reference") return [];

    const sections = activeData?.sections || [];
    const search = searchTerm.trim().toLowerCase();

    if (!search) return sections;

    return sections
      .map((section) => {
        const matchingItems = section.items.filter((item) => {
          const searchableText = [
            section.category,
            item.name,
            ...(item.ingredients || []),
            item.glass,
            item.garnish,
            item.notes,
            item.story,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(search);
        });

        return {
          ...section,
          items: matchingItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [activeData, activeTab, searchTerm]);

  const totalItems = filteredSections.reduce(
    (total, section) => total + section.items.length,
    0,
  );

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSearchTerm("");
    setOpenItemKey(null);
  }

  function handleItemClick(itemKey) {
    setOpenItemKey((currentKey) => (currentKey === itemKey ? null : itemKey));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>The Lexington</p>
        <h1>Specs App</h1>
      </header>

      <nav className={styles.tabs} aria-label="Spec sections">
        <button
          className={`${styles.tabButton} ${
            activeTab === "menu" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("menu")}
          type="button"
        >
          Menu
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === "drinks" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("drinks")}
          type="button"
        >
          Drinks
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === "reference" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("reference")}
          type="button"
        >
          Reference
        </button>
      </nav>

      {activeTab !== "reference" && (
        <>
          <section className={styles.searchSection}>
            <label htmlFor="spec-search">Search all {activeData.label}</label>
            <input
              id="spec-search"
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setOpenItemKey(null);
              }}
              placeholder="Search item, ingredient, garnish, glass, note..."
            />

            <p className={styles.resultCount}>
              {totalItems} {totalItems === 1 ? "result" : "results"}
            </p>
          </section>

          <section className={styles.sections}>
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <div className={styles.sectionBlock} key={section.category}>
                  <h2>{section.category}</h2>

                  <div className={styles.itemList}>
                    {section.items.map((item) => {
                      const itemKey = `${activeTab}-${section.category}-${item.name}`;
                      const isOpen = openItemKey === itemKey;

                      return (
                        <article className={styles.itemBlock} key={itemKey}>
                          <button
                            className={`${styles.itemButton} ${
                              isOpen ? styles.openButton : ""
                            }`}
                            type="button"
                            onClick={() => handleItemClick(itemKey)}
                            aria-expanded={isOpen}
                          >
                            <span>{item.name}</span>
                            <span className={styles.buttonIcon}>
                              {isOpen ? "−" : "+"}
                            </span>
                          </button>

                          {isOpen && (
                            <div className={styles.revealPanel}>
                              <SpecDetails item={item} />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                No specs found for “{searchTerm}”.
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "reference" && <ReferencePanel />}
    </main>
  );
}

function SpecDetails({ item }) {
  return (
    <div className={styles.specDetails}>
      {item.ingredients?.length > 0 && (
        <section className={styles.specSection}>
          <h3>Ingredients</h3>
          <ul>
            {item.ingredients.map((ingredient, index) => (
              <li key={`${item.name}-ingredient-${index}`}>{ingredient}</li>
            ))}
          </ul>
        </section>
      )}

      <SpecField label="Glass" value={item.glass} />
      <SpecField label="Garnish" value={item.garnish} />
      <SpecField label="Notes" value={item.notes} />
      <SpecField label="Story" value={item.story} />
    </div>
  );
}

function SpecField({ label, value }) {
  if (!value) return null;

  return (
    <section className={styles.specSection}>
      <h3>{label}</h3>
      <p>{value}</p>
    </section>
  );
}

function ReferencePanel() {
  const wellSpirits = lexingtonData.reference?.wellSpirits || {};
  const terms = lexingtonData.reference?.terms || [];

  return (
    <section className={styles.referencePanel}>
      <div className={styles.referenceCard}>
        <h2>Well Spirits</h2>

        <div className={styles.spiritList}>
          {Object.entries(wellSpirits).map(([spirit, brand]) => (
            <div className={styles.spiritRow} key={spirit}>
              <span>{formatLabel(spirit)}</span>
              <strong>{brand}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.referenceCard}>
        <h2>Terms</h2>

        <div className={styles.termList}>
          {terms.map((term) => (
            <div className={styles.termItem} key={term.term}>
              <h3>{term.term}</h3>
              <p>{term.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}
