import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import IndicatorMappingsManager from "./IndicatorMappingManager";
import '../../styles/uploadPDF.css'



pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const UploadPDF = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [showMappings, setShowMappings] = useState(false);
  
  const [validIndicators, setValidIndicators] = useState(() => {
    const saved = localStorage.getItem('validIndicators');
    return saved ? JSON.parse(saved) : [
      'СОЭ', 'эритроциты', 'гемоглобин', 'гемотакрит',
    'средний объем эритроцитов (МСV)',
    'среднее содержание гемоглобина в эритроцитах (МСH)',
    'средняя концентрация гемоглобина в эритроцитах (MCHC)',
    'распределение эритроцитов по объему (RDW-SD)',
    'распределение эритроцитов по объему (вариабельность)',
    'тромбоциты', 'тромбоциты %',
    'средний объем тромбоцитов (MPV)',
    'коэффициент больших тромбоцитов',
    'лейкоциты', 'нейтрофилы', 'лимфоциты', 'моноциты',
    'эозинофилы', 'базофилы', 'нейтрофилы %',
    'лимфоциты %', 'моноциты %', 'эозинофилы %',
    'базофилы %',

    // Гормоны
    'тироксин Т4 св', 'ТТГ', 'Т3 св', 'анти ТПО',
    'паратгормон',

    // Биохимические показатели
    'общий белок', 'альбумин', '% соотношение',
    'белковые фракции', 'альбумин %',
    'Альфа-1-глобулин', 'Альфа-1-глобулин %',
    'Альфа-2-глобулин', 'Альфа-2-глобулин %',
    'Бета-1-глобулин', 'Бета-1-глобулин %',
    'Бета-2-глобулин', 'Бета-2-глобулин %',
    'гамма-глобулин', 'гамма-глобулин %',
    'билирубин непрямой', 'билирубин прямой', 'билирубин общий',
    'АЛТ', 'АСТ', 'Коэфф. де Ритиса (АСТ/АЛТ)',
    'ГГТ', 'глюкоза', 'гликированный гемоглобин',
    'инсулин', 'щелочная фосфатаза', 'железо сывороточное',
    'ферритин', 'трансферрин',
    'ЛПВП', 'ЛПНП', 'ЛПОНП', 'триглицериды',
    'не ЛПВП', 'общий холестерин', 'липопротеин А',
    'коэффициент атерогенности',
    'СРБ', 'витамин В12 (цианокобаламин)',
    'гомоцистеин', 'витамин D (25-ОН)',
    'мочевая кислота', 'креатинин', 'мочевина',
    'кальций общий', 'магний', 'цинк', 'фосфор',
    'натрий', 'калий', 'лактат', 'ЛДГ', 'Фибриноген', 'АЧТВ', 'МНО', 'Протромбин', 'Протромбинованое время', 'Протромбин (по квику)',

    // Аминокислоты
    '1-метилгистидин', '3-метилгистидин',
    'α-аминоадипиновая кислота', 'α-аминомасляная кислота',
    'β-аланин', 'β-аминоизомасляная кислота',
    'γ-аминомасляная кислота', 'аланин', 'алло-изолейцин',
    'ансерин', 'аргинин', 'аргинин-янтарная кислота',
    'аспарагин', 'аспарагиновая кислота', 'валин',
    'гидроксилизин', 'гидроксипролин', 'гистидин',
    'глицин', 'глутамин', 'глутаминовая кислота',
    'гомоцистеин', 'гомоцитрулин', 'изолейцин',
    'карнозин', 'лейцин', 'лизин', 'метионин',
    'орнитин', 'пипеколиновая кислота', 'пролин',
    'саркозин', 'серин', 'таурин', 'тирозин',
    'треонин', 'триптофан', 'фенилаланин',
    'фосфосерин', 'фосфоэтаноламин', 'цистотионин',
    'цистин', 'цитруллин', 'этаноламин',

    // Органические кислоты
    'молочная кислота', 'пировиноградная кислота',
    'лимонная кислота', 'цис-аконитовая кислота',
    'изолимонная кислота', '2-кетоглутаровая кислота',
    'янтарная кислота', 'фумаровая кислота',
    'яблочная кислота', '2-метилгипуровая кислота',
    'ацетоуксусная кислота', '3-гидроксимасляная кислота',
    'малоновая кислота',

    // Прочие метаболиты
    'гликолиевая кислота', 'глицериновая кислота',
    'щавелевая кислота', 'метаболиты витаминов В1, В2, В5, В7',
    'глутаровая кислота', 'адипиновая кислота',
    'себациновая кислота', 'ксантуреновая кислота',
    'кинуреновая кислота', 'метилмалоновая кислота',
    'пироглутаминовая кислота'
    ];
  });

  const [indicatorMappings, setIndicatorMappings] = useState(() => {
    const saved = localStorage.getItem('indicatorMappings');
    return saved ? JSON.parse(saved) : {};
  });

  
  useEffect(() => {
    localStorage.setItem('indicatorMappings', JSON.stringify(indicatorMappings));
    localStorage.setItem('validIndicators', JSON.stringify(validIndicators));
  }, [indicatorMappings, validIndicators]);


  const updateProgress = (current, total) => {
    const percentage = Math.round((current / total) * 100);
    setProgress(percentage);
    setProcessedFiles(current);
  };

  const extractDateFromFilename = (filename) => {
    const patterns = [
      /(\d{4})(\d{2})(\d{2})/,
      /(\d{2})(\d{2})(\d{4})/,
      /(\d{4})[.-](\d{2})[.-](\d{2})/,
      /(\d{2})[.-](\d{2})[.-](\d{4})/,
      /(\d{4})\s+(\d{2})\s+(\d{2})/,
      /(\d{2})\s+(\d{2})\s+(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        const [_, part1, part2, part3] = match;
        if (part1.length === 4) {
          return `${part1}-${part2}-${part3}`;
        }
        return `${part3}-${part2}-${part1}`;
      }
    }
    return null;
  };


  const filterNoise = (text) => {
    const noisePatterns = [
      /Дата взятия образца:/,
      /Дата поступления образца:/,
      /Дата печати результата:/,
      /Дата выдачи:/,
      /Пол:/,
      /Возраст:/,
      /ИНЗ:/,
      /Врач:/,
      /ООО/,
      /www\./,
      /стр\./,
      /Наименование:/,
      /Результат:/,
      /Единицы:/,
      /Комментарии к заявке:/,
      /Название принимаемых пациентом препаратов:/,
      /Хранение и транспортировка/,
      /Результаты исследований не являются диагнозом/,
      /Внимание!/,
      /Врач/,
      /^[А-Яа-я]+(\s+[А-Яа-я]+){1,2}$/
    ];

    return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => {
      // Сохраняем строки, содержащие цифры или специфические единицы измерения
      if (/\d/.test(line) || /10\*9\/л|кл\/л|г\/л/.test(line)) {
        return true;
      }
      return !noisePatterns.some(pattern => pattern.test(line));
    })
    .join("\n");
  };

  const unitsPatterns = [
    '10[×*x·]\\d+/?л',   // Любые степени десяти, например 10×9/л, 10^12/л
    '[кКk]л/?л',         // Клетки на литр
    'г/?л',              // Грамм на литр
    'мг/?л',             // Миллиграмм на литр
    'мг/?дл',            // Миллиграмм на децилитр
    'г/?мл',             // Грамм на миллилитр
    'мкг/?мл',           // Микрограмм на миллилитр
    'нг/?мл',            // Нанограмм на миллилитр
    'пг/?мл',            // Пикограмм на миллилитр
    'ммоль/?л',          // Миллимоль на литр
    'мкмоль/?л',         // Микромоль на литр
    'ммол/?моль',        // Миллимоль на моль
    'мккат/?л',          // Микрокатал на литр
    'ед/?[лмм]л?',       // Единицы измерения: ед/л, ед/мл
    'тыс\\.?/?мкл',      // Тысячи клеток на микролитр
    'кл/?мкл',           // Клетки на микролитр
    'кл/?л',             // Клетки на литр
    '%',                 // Проценты
    'сек',               // Секунды
    'мин',               // Минуты
    'час',               // Часы
    'мм рт.? ?ст.?',     // Миллиметры ртутного столба
    'кПа',               // Килопаскали
    'атм',               // Атмосферы
    'мм/?час',           // Миллиметры в час
    'л/?мин',            // Литры в минуту
    'л/?с',              // Литры в секунду
    'фл',                // Флаконы
    'мл/?мин',           // Миллилитры в минуту
    'л',                 // Литры
    'мл',                // Миллилитры
    'см',                // Сантиметры
    'мм',                // Миллиметры
    'м',                 // Метры
    'мкм',               // Микрометры
    'мг/?кг',            // Миллиграммы на килограмм
    'ккал',              // Килокалории
    'кДж',               // Килоджоулы
    'бит/мин',           // Удары сердца в минуту (bpm)
    'бит/сек',           // Биты в секунду
    'm?kat/?л',          // Катал на литр или микрокатал
    'тыс/?мкл',          // Тысячи клеток на микролитр
    'мкл',               // Микролитры
    'нл',                // Нанолитры
    'pl',                // Пиколитры
    'г/дл',              // Граммы на децилитр
    'мкг/?л',            // Микрограммы на литр
    'мм/сек',            // Миллиметры в секунду
    'мкмоль/?моль',      // Микромоль на моль
    'пг/?л',             // Пикограмм на литр
    'ммоль/?моль',       // Миллимоль на моль
    'ммоль/?сут',        // Миллимоль в сутки
    'мг/?сут',           // Миллиграмм в сутки
    'кл/?сек',           // Клетки в секунду
    '\\d+°[cC]',         // Градусы Цельсия
    '\\d+°[fF]'          // Градусы Фаренгейта
  ].join('|');
  
  
  
  // Улучшенная функция объединения строк
  const mergeBrokenLines = (text) => {
    const lines = text.split("\n");
    const mergedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i]?.trim() || '';
      const next = lines[i + 1]?.trim() || '';
      
      // Проверяем, может ли следующая строка быть единицей измерения
      const isNextLineUnits = next && new RegExp(`^(${unitsPatterns})$`, 'i').test(next);
      
      if (current && next && (
        (!/\d/.test(current) && !/:/.test(current) && /\d/.test(next)) ||
        isNextLineUnits
      )) {
        mergedLines.push(`${current} ${next}`);
        i += 1;
      } else {
        mergedLines.push(current);
      }
    }
    
    return mergedLines.join("\n");
  };

  const findIndicator = (name) => {
    return validIndicators.find(indicator =>
      name.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  const parsePdfData = (text, date) => {
    const cleanText = filterNoise(text);
    const mergedText = mergeBrokenLines(cleanText);
    const lines = mergedText.split("\n").filter(line => /\d/.test(line));
  
    // Updated regex pattern to better handle reference values
    const regex = /^(.*?[а-яА-Яa-zA-Z].*?)\s+([\d.,]+)\s*(10\*9\/л|10\*9\/л|кл\/л|г\/л|сек|%|ммоль\/л|мг\/л|ед\/л|ед\/мл|мкмоль\/л|кПа|мл\/мин|мг\/дл|мкг\/мл|фл|кл|пг|мм\/час|[а-яА-Яa-zA-Z]*)\s*(?:(\d+[\d.,\-–\s]*)|[-–]\s*(\d+))?$/;
  
    return lines
      .map(line => {
        const match = line.match(regex);
        if (!match) return null;
  
        const indicatorName = match[1]?.trim() || "";
        const validIndicator = findIndicator(indicatorName);
  
        if (!validIndicator) return null;
  
        // Improve units handling
        let units = match[3]?.trim() || "";
        if (units === "10*9/") {
          units = "10*9/л";
        }

        // Enhanced reference values handling
        let refValue = match[4] || match[5] || "";
        if (match[5]) {
          // If we caught a value after a dash/hyphen, prefix it with "0-"
          refValue = `0-${match[5]}`;
        }
        if (refValue && !refValue.includes("-") && !refValue.includes("–")) {
          // If we have a single number, assume it's the upper limit
          refValue = `0-${refValue}`;
        }
  
        return {
          Исследование: validIndicator,
          Результат: match[2]?.trim().replace(",", ".") || "",
          Единицы: units,
          "Референсные значения": refValue.trim().replace(",", "."),
          Дата: date
        };
      })
      .filter(Boolean);
  };

  const deleteIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: prev[standardName].filter(v => v !== variant)
    }));
  };

  const convertPdfToImages = async (pdfData) => {
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const images = [];

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL("image/png"));
    }

    return images;
  };

  const extractTextWithTesseract = async (image) => {
    const result = await Tesseract.recognize(image, "eng+rus", {
      logger: (m) => {
        console.log(m);
      },
    });
    return result.data.text;
  };

  const exportToExcel = (data, fileName) => {
    // Sort data by date and then by indicator name
    const sortedData = data.sort((a, b) => {
      // First sort by date
      const dateComparison = new Date(a.Дата) - new Date(b.Дата);
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are equal, sort by indicator name
      return a.Исследование.localeCompare(b.Исследование);
    });

    // Group data by date
    const groupedData = sortedData.reduce((acc, item) => {
      if (!acc[item.Дата]) {
        acc[item.Дата] = [];
      }
      acc[item.Дата].push(item);
      return acc;
    }, {});

    // Create a workbook
    const wb = XLSX.utils.book_new();

    // Create sheets for each date
    Object.entries(groupedData).forEach(([date, items]) => {
      const ws = XLSX.utils.json_to_sheet(items, {
        header: ["Исследование", "Результат", "Единицы", "Референсные значения", "Дата"]
      });

      ws["!cols"] = [
        { wch: 30 }, // Исследование
        { wch: 15 }, // Результат
        { wch: 20 }, // Единицы
        { wch: 30 }, // Референсные значения
        { wch: 15 }  // Дата
      ];

      // Add sheet for each date
      XLSX.utils.book_append_sheet(wb, ws, date.replace(/-/g, '.'));
    });

    // Create summary sheet with all data
    const summaryWs = XLSX.utils.json_to_sheet(sortedData, {
      header: ["Исследование", "Результат", "Единицы", "Референсные значения", "Дата"]
    });

    summaryWs["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 }
    ];

    // Add summary sheet as the first sheet
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Все анализы');

    // Save the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };


  const processPdfFiles = async (files) => {
    const parsedData = [];
    setLoading(true);

    for (const file of files) {
      try {
        const fileDate = extractDateFromFilename(file.name);
        if (!fileDate) {
          console.error(`Неверный формат даты в имени файла: ${file.name}`);
          continue;
        }

        const pdfData = await file.arrayBuffer();
        const pages = await convertPdfToImages(pdfData);

        const pageResults = await Promise.all(
          pages.map(async (pageImage) => {
            const text = await extractTextWithTesseract(pageImage);
            const results = parsePdfData(text, fileDate);
            return results.map(result => ({
              ...result,
              Дата: fileDate
            }));
          })
        );

        parsedData.push(...pageResults.flat());
        updateProgress(parsedData.length, files.length * pages.length);
      } catch (error) {
        console.error(`Ошибка обработки файла ${file.name}:`, error);
      }
    }

    exportToExcel(parsedData, "Medical_Analysis");
    setLoading(false);
  };

  const addIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: [...(prev[standardName] || []), variant]
    }));
  };

  

  const handleAddMapping = (newIndicator) => {
    setValidIndicators(prev => [...prev, newIndicator]);
    setIndicatorMappings(prev => ({
      ...prev,
      [newIndicator]: []
    }));
  };


  const handleDeleteMapping = (indicatorName) => {
    setValidIndicators(prev => prev.filter(indicator => indicator !== indicatorName));
    setIndicatorMappings(prev => {
      const { [indicatorName]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => !extractDateFromFilename(file.name));
    if (invalidFiles.length > 0) {
      alert('Некоторые файлы имеют неверный формат даты в названии. Поддерживаемые форматы:\nYYYYMMDD\nDDMMYYYY\nYYYY.MM.DD\nDD.MM.YYYY\nYYYY MM DD\nDD MM YYYY');
      return;
    }

    setLoading(true);
    setFileCount(files.length);
    setProcessedFiles(0);
    setProgress(0);

    try {
      await processPdfFiles(files);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Загрузка PDF файлов с анализами</h2>
        <button
          type="button"
          onClick={() => setShowMappings(!showMappings)}
          className="file-input"
        >
          {showMappings ? 'Скрыть настройки' : 'Настройки показателей'}
        </button>

        {showMappings && (
          <IndicatorMappingsManager
            mappings={indicatorMappings}
            onAddMapping={handleAddMapping}
            onAddVariant={addIndicatorVariant}
            onDeleteMapping={handleDeleteMapping}
            onDeleteVariant={deleteIndicatorVariant}
          />
        )} 
      </div>

      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="file-input"
        disabled={loading}
      />

      {loading && (
        <div className="loading">
          <p>Обработано файлов: {processedFiles} из {fileCount}</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress}% завершено</p>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;