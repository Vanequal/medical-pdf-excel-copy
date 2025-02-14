import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import IndicatorMappingsManager from "./IndicatorMappingManager";
import '../../styles/uploadPDF.css'



pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const UploadPDF = ({onFileDownloaded}) => {
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
      'базофилы %', 'ЛГ', "ФСГ",

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
    // Возвращаем пустой объект если нет сохраненных данных
    return saved ? JSON.parse(saved) : {};
  });


  useEffect(() => {
    localStorage.setItem('indicatorMappings', JSON.stringify(indicatorMappings));
    localStorage.setItem('validIndicators', JSON.stringify(validIndicators));
  }, [indicatorMappings, validIndicators]);


  const updateProgress = (current, total) => {
    const percentage = Math.round((current / total) * 100);
    setProgress(percentage);
    setProcessedFiles(current); // Здесь теперь считаем страницы, а не файлы
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

  const isRefValueInRange = (actual, expected) => {
    const normalizeRef = (ref) => {
      return ref.replace(/[,\s]/g, '').replace(/[–—]/g, '-');
    };

    return normalizeRef(actual) === normalizeRef(expected);
  };

  const parsePdfData = (text, date) => {
    // Use the preProcessText function to prepare the text
    const processedText = preProcessText(text);
    
    const cleanText = filterNoise(processedText);
    const mergedText = mergeBrokenLines(cleanText);
    const lines = mergedText.split("\n").filter(line => line.trim());

    const strictPattern = /(.*?)[\s:]+([-↓↑]?\s*\d+[.,]?\d*)(?:\s*([а-яА-Яa-zA-Z0-9\/%×\^*]+))?(?:\s*([<>]?\s*\d+[.,]?\d*(?:\s*[-–]\s*\d+[.,]?\d*)?))?\s*$/i;
    const flexiblePattern = /([а-яА-Я\s\-()]+)[:\s]*([-↓↑]?\s*\d+[.,]?\d*)/i;

    let results = [];

    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];

      const namePattern = /^([а-яА-Я\s\-()]+)$/i;
      const valuePattern = /^\s*([-↓↑]?\s*\d+[.,]?\d*)(?:\s*([а-яА-Яa-zA-Z0-9\/%×\^*]+))?(?:\s*([<>]?\s*\d+[.,]?\d*(?:\s*[-–]\s*\d+[.,]?\d*)?))?\s*$/i;

      const nameMatch = currentLine.match(namePattern);
      const valueMatch = nextLine.match(valuePattern);

      if (nameMatch && valueMatch) {
        let indicatorName = nameMatch[1].trim();
        const [_unused, value, units, refValue] = valueMatch;

        const validIndicator = findIndicator(indicatorName);
        if (validIndicator) {
          results.push({
            Исследование: validIndicator,
            Результат: normalizeValue(value),
            Единицы: units ? normalizeUnits(units.trim()) : "",
            "Референсные значения": refValue ? normalizeRefValue(refValue.trim()) : "",
            Дата: date,
            Достоверность: 4,
            ТипПарсинга: 'контекстный'
          });

          i++; // Пропускаем следующую строку
          continue;
        }
      }
    }

    lines.forEach(line => {
      const strictMatch = line.match(strictPattern);
      if (strictMatch) {
        let [_unused, indicatorName, value, units, refValue] = strictMatch;
        indicatorName = indicatorName.trim().replace(/[:\s]+$/, '');
        const validIndicator = findIndicator(indicatorName);

        if (!validIndicator) return;

        value = normalizeValue(value);
        if (!isValidValue(value)) return;

        units = units ? normalizeUnits(units.trim()) : "";
        refValue = refValue ? normalizeRefValue(refValue.trim()) : "";

        if (!validateResult(value, units, validIndicator)) return;

        const reliability = calculateReliability({
          value,
          units,
          refValue,
          indicator: validIndicator,
          matchType: 'strict'
        });

        results.push({
          Исследование: validIndicator,
          Результат: value,
          Единицы: units,
          "Референсные значения": refValue,
          Дата: date,
          Достоверность: reliability,
          ТипПарсинга: 'строгий'
        });

        return;
      }

      const flexibleMatch = line.match(flexiblePattern);
      if (flexibleMatch) {
        let [_unused, indicatorName, value] = flexibleMatch;
        indicatorName = indicatorName.trim().replace(/[:\s]+$/, '');
        const validIndicator = findIndicator(indicatorName);

        if (!validIndicator) return;

        value = normalizeValue(value);
        if (!isValidValue(value)) return;

        const unitsMatch = line.match(new RegExp(`(${unitsPatterns})`, 'i'));
        const units = unitsMatch ? normalizeUnits(unitsMatch[1]) : "";

        if (!validateResult(value, units, validIndicator)) return;

        const reliability = calculateReliability({
          value,
          units,
          refValue: "",
          indicator: validIndicator,
          matchType: 'flexible'
        });

        results.push({
          Исследование: validIndicator,
          Результат: value,
          Единицы: units,
          "Референсные значения": "",
          Дата: date,
          Достоверность: reliability,
          ТипПарсинга: 'гибкий'
        });
      }
    });

    const groupedResults = results.reduce((acc, curr) => {
      if (!acc[curr.Исследование] ||
        acc[curr.Исследование].Достоверность < curr.Достоверность) {
        acc[curr.Исследование] = curr;
      }
      return acc;
    }, {});

    return Object.values(groupedResults)
      .filter(result => result.Достоверность >= 3)
      .sort((a, b) => b.Достоверность - a.Достоверность)
      .map(({ Достоверность, ТипПарсинга, ...rest }) => rest);
  };

  const calculateReliability = ({ value, units, refValue, indicator, matchType }) => {
    let score = 0;

    if (value) score += 2;
    if (units) score += 1;
    if (refValue) score += 1;
    if (matchType === 'strict') score += 2;

    if (indicatorMappings[indicator]?.units &&
      isMatchingUnits(units, indicatorMappings[indicator].units)) {
      score += 2;
    }

    if (refValue && indicatorMappings[indicator]?.refValue &&
      isRefValueInRange(refValue, indicatorMappings[indicator].refValue)) {
      score += 2;
    }

    return score;
  };

  
  const preProcessText = (text) => {
    // 1. Создаем более умный алгоритм объединения переносов строк
    const fixedLineBreaks = fixLineBreaks(text);
    
    // 2. Идентифицируем табличные структуры
    const withDetectedTables = detectAndPreserveTables(fixedLineBreaks);
    
    // 3. Нормализуем пробелы и специальные символы
    const normalizedText = normalizeSpecialChars(withDetectedTables);
    
    return normalizedText;
  };
  
  const fixLineBreaks = (text) => {
    const lines = text.split("\n");
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i]?.trim() || '';
      const next = lines[i + 1]?.trim() || '';
      
      // Проверяем на переносы в середине показателя
      if (current && next) {
        // Случай когда перенесено название показателя
        if (/^[а-яА-Я\s\-()]+$/.test(current) && 
            /^\d+[.,]?\d*/.test(next)) {
          result.push(`${current} ${next}`);
          i++;
          continue;
        }
        
        // Случай когда перенесены единицы измерения
        if (/\d+[.,]?\d*$/.test(current) && 
            new RegExp(`^(${unitsPatterns})`, 'i').test(next)) {
          result.push(`${current} ${next}`);
          i++;
          continue;
        }
        
        // Случай когда перенесены референсные значения
        if (new RegExp(`(${unitsPatterns})$`, 'i').test(current) && 
            /^\s*[<>]?\s*\d+[.,]?\d*/.test(next)) {
          result.push(`${current} ${next}`);
          i++;
          continue;
        }
      }
      
      result.push(current);
    }
    
    return result.join("\n");
  };
  
  const detectAndPreserveTables = (text) => {
    const lines = text.split("\n");
    const result = [];
    
    let inTable = false;
    let tableLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Определяем начало таблицы по структуре строки
      if (!inTable && isLikelyTableHeader(line, lines[i+1])) {
        inTable = true;
        tableLines = [line];
      } else if (inTable) {
        if (isLikelyTableRow(line)) {
          tableLines.push(line);
        } else {
          // Обработка найденной таблицы
          result.push(...processTableLines(tableLines));
          tableLines = [];
          inTable = false;
          result.push(line);
        }
      } else {
        result.push(line);
      }
    }
    
    // Обработать последнюю таблицу, если она есть
    if (tableLines.length > 0) {
      result.push(...processTableLines(tableLines));
    }
    
    return result.join("\n");
  };
  
  const isLikelyTableHeader = (line, nextLine) => {
    // Определяем заголовок таблицы по ключевым словам
    const headerKeywords = ['показатель', 'параметр', 'результат', 'норма', 'единицы', 'значение', 'анализ'];
    const hasKeywords = headerKeywords.some(keyword => line.toLowerCase().includes(keyword));
    
    // Проверяем, что следующая строка похожа на данные в таблице
    const nextLineDataLike = nextLine && /^\s*[а-яА-Я].+\s+\d+[.,]?\d*/.test(nextLine);
    
    return hasKeywords && nextLineDataLike;
  };
  
  const isLikelyTableRow = (line) => {
    // Проверяем, похожа ли строка на данные в таблице
    return /^\s*[а-яА-Я].*\s+\d+[.,]?\d*/.test(line);
  };
  
  const processTableLines = (tableLines) => {
    // Обработка табличных данных для улучшения парсинга
    return tableLines.map(line => {
      // Добавляем разделители для лучшего распознавания структуры
      return line.replace(/(\s{2,})/g, ' | ');
    });
  };
  
  const normalizeSpecialChars = (text) => {
    return text
      .replace(/[\u2013\u2014\u2212]/g, '-') // Нормализация разных типов тире
      .replace(/[«»"„"]/g, '"')            // Нормализация кавычек
      .replace(/–/g, '-')                  // Еще один вариант тире
      .replace(/\.{3,}/g, '...')            // Многоточие
      .replace(/(\d),(\d)/g, '$1.$2');     // Замена запятых на точки в числах
  };


  // Вспомогательные функции
  const normalizeValue = (value) => {
    return value.trim()
      .replace('↓', '')
      .replace('↑', '')
      .replace(",", ".")
      .trim();
  };

  const isValidValue = (value) => {
    return /^\d*\.?\d+$/.test(value);
  };

  const validateResult = (value, units, indicator) => {
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0) return false;

    const limits = {
      'СОЭ': { min: 0, max: 100 },
      'гемоглобин': { min: 20, max: 300 },
      'эритроциты': { min: 0.5, max: 10 },
      'гематокрит': { min: 10, max: 70 },
      'тромбоциты': { min: 10, max: 1000 },
      'лейкоциты': { min: 0.1, max: 100 },
      // Добавьте другие показатели
    };

    if (limits[indicator]) {
      return numValue >= limits[indicator].min && numValue <= limits[indicator].max;
    }

    return true;
  };

  const isMatchingUnits = (actual, expected) => {
    const normalize = (unit) => unit.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[·×]/g, '*');

    return normalize(actual) === normalize(expected);
  };

  const filterNoise = (text) => {
    const noisePatterns = [
      /Дата взятия образца:/i,
      /Дата поступления образца:/i,
      /Дата печати результата:/i,
      /Дата выдачи:/i,
      /Пол:/i,
      /Возраст:/i,
      /ИНЗ:/i,
      /Врач:/i,
      /ООО/i,
      /www\./i,
      /стр\./i,
      /Наименование:/i,
      /Результат:/i,
      /Единицы:/i,
      /Комментарии к заявке:/i,
      /Название принимаемых пациентом препаратов:/i,
      /Хранение и транспортировка/i,
      /Результаты исследований не являются диагнозом/i,
      /Внимание!/i,
      /^[А-Яа-я]+(\s+[А-Яа-я]+){1,2}$/i,
      /номер:/i,
      /пациент:/i,
      /телефон:/i,
      /страница/i,
      /лаборатория/i,
      /анализ/i,
      /норма:/i,
      /референс:/i
    ];

    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => {
        // Сохраняем строки с числами или единицами измерения
        if (/[\d.,]+/.test(line) || new RegExp(unitsPatterns, 'i').test(line)) {
          // Проверяем, не является ли строка шумом
          return !noisePatterns.some(pattern => pattern.test(line));
        }
        return false;
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
    '\\d+°[fF]',   // Градусы Фаренгейта
    '10\\^?12/?л',
    '10\\^?9/?л',
    '10\\^?6/?л',
    'г/?л',
    'фл',
    'пг',
    '%',
    'ммоль/?л',
    'мкмоль/?л',
    'ед/?л',
    'мм/?ч',
    'мкг/?мл',
    'нг/?мл',
    'мг/?л',
    'мкг/?л'
  ].join('|');


  const normalizeUnits = (units) => {
    if (!units) return "";

    // Clean up the input but preserve notation style
    let cleanedUnits = units.trim()
      .replace(/\s+/g, '') // Remove extra spaces
      .replace(/[·]/g, '*'); // Convert middle dot to asterisk

    // Define unit patterns that should be preserved exactly as they are
    const exactUnits = [
      '10*12/л',
      '10*9/л',
      '10*6/л',
      '10^12/л',
      '10^9/л',
      '10^6/л',
      '10×12/л',
      '10×9/л',
      '10×6/л',
      'г/л',
      'фл',
      'пг',
      '%',
      'ммоль/л',
      'мкмоль/л',
      'ед/л'
    ];

    // Check for exact matches first
    if (exactUnits.includes(cleanedUnits)) {
      return cleanedUnits;
    }

    // Handle variations in separators while preserving the original notation type
    const scientificMatch = cleanedUnits.match(/10([*×^])(\d+)\/л/i);
    if (scientificMatch) {
      const [_, notation, number] = scientificMatch;
      return `10${notation}${number}/л`;
    }

    // Handle basic unit variations
    const basicUnits = {
      'г\\л': 'г/л',
      'г.л': 'г/л',
    };

    for (const [pattern, replacement] of Object.entries(basicUnits)) {
      if (new RegExp(`^${pattern}$`, 'i').test(cleanedUnits)) {
        return replacement;
      }
    }

    return cleanedUnits;
  };
  const normalizeRefValue = (refValue) => {
    if (!refValue) return "";

    // Очистка и базовая нормализация
    refValue = refValue.trim()
      .replace(/\s+/g, '')  // Убираем лишние пробелы
      .replace(/,/g, '.')   // Заменяем запятые на точки
      .replace(/[–—]/g, '-'); // Стандартизируем тире

    // Обработка диапазонов с отрицательными числами
    const negativePattern = /(-?\d+\.?\d*)\s*-\s*(-?\d+\.?\d*)/;
    const negativeMatch = refValue.match(negativePattern);
    if (negativeMatch) {
      return `${negativeMatch[1]}-${negativeMatch[2]}`;
    }

    // Если просто одно отрицательное число
    if (/^-\d+\.?\d*$/.test(refValue)) {
      return `${refValue}`;
    }

    // Обычный диапазон
    const normalPattern = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;
    const normalMatch = refValue.match(normalPattern);
    if (normalMatch) {
      return `${normalMatch[1]}-${normalMatch[2]}`;
    }

    // Если одно положительное число
    if (/^\d+\.?\d*$/.test(refValue)) {
      return `0-${refValue}`;
    }

    return refValue;
  };

  // Улучшенная функция объединения строк
  const mergeBrokenLines = (text) => {
    const lines = text.split("\n");
    const mergedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i]?.trim() || '';
      const next = lines[i + 1]?.trim() || '';

      // Проверка на перенос единиц измерения или референсных значений
      const hasUnits = new RegExp(`(${unitsPatterns})$`, 'i').test(next);
      const isRefValue = /^[<>]?\s*\d+[\d.,\-–\s]*$/.test(next);

      if (current && next && (hasUnits || isRefValue)) {
        mergedLines.push(`${current} ${next}`);
        i++;
      } else {
        mergedLines.push(current);
      }
    }

    return mergedLines.join("\n");
  };

  const findIndicator = (name) => {
    if (!name) return null;

    const normalizedName = name.toLowerCase().trim();

    // Прямое совпадение
    const directMatch = validIndicators.find(indicator =>
      normalizedName === indicator.toLowerCase()
    );
    if (directMatch) return directMatch;

    // Улучшенный нечеткий поиск:
    // 1. Проверим подстроки с удалением стоп-слов
    const stopWords = ['уровень', 'анализ', 'показатель', 'тест', 'общий', 'содержание'];
    let cleanedName = normalizedName;
    stopWords.forEach(word => {
      cleanedName = cleanedName.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });
    cleanedName = cleanedName.trim();

    // 2. Попробуем найти по очищенному названию
    const partialMatch = validIndicators.find(indicator => {
      const indicatorLower = indicator.toLowerCase();
      return cleanedName.includes(indicatorLower) ||
        indicatorLower.includes(cleanedName);
    });

    if (partialMatch) return partialMatch;

    // 3. Лемматизация и стемминг (упрощенный вариант)
    const lemmatized = simpleLemmatize(normalizedName);

    return validIndicators.find(indicator => {
      const indicatorLemma = simpleLemmatize(indicator.toLowerCase());
      return lemmatized.includes(indicatorLemma) ||
        indicatorLemma.includes(lemmatized);
    }) || null;
  };

  const simpleLemmatize = (text) => {
    // Очень простая версия стемминга для русского языка
    return text
      .replace(/ение$|ания$|ия$|ий$/g, '')
      .replace(/ать$|ить$/g, '')
      .replace(/ей$|ов$/g, '');
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

  const processTextInTwoPhases = (text, date) => {
    const lines = text.split("\n").filter(line => line.trim());

    // Первый проход: собираем все возможные значения
    const allPossibleMatches = lines.map((line, index) => {
      // Разные типы парсинга...
      // Возвращаем объект с индексом строки, совпадением и достоверностью
    }).filter(Boolean);

    // Второй проход: уточняем на основе контекста
    const refinedMatches = [];

    for (const match of allPossibleMatches) {
      // Проверяем соседние строки
      const nearbyLines = lines.slice(
        Math.max(0, match.lineIndex - 2),
        Math.min(lines.length, match.lineIndex + 3)
      );

      // Если поблизости есть связанные показатели, повышаем достоверность
      const isInContext = checkContextRelevance(match.indicator, nearbyLines);

      if (isInContext) {
        match.reliability += 1;
      }

      refinedMatches.push(match);
    }

    // Сортируем по достоверности и возвращаем результаты
    return refinedMatches
      .filter(m => m.reliability >= 3)
      .sort((a, b) => b.reliability - a.reliability)
      .map(/* formatting */);
  };

  const checkContextRelevance = (indicator, nearbyLines) => {
    // Группы связанных показателей
    const relatedGroups = {
      'СОЭ': ['эритроциты', 'гемоглобин', 'лейкоциты'],
      'тироксин Т4 св': ['ТТГ', 'Т3 св', 'анти ТПО'],
      // ...другие группы связанных показателей
    };

    const relatedIndicators = relatedGroups[indicator] || [];

    return nearbyLines.some(line =>
      relatedIndicators.some(related =>
        line.toLowerCase().includes(related.toLowerCase())
      )
    );
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

    // Сначала подсчитаем общее количество страниц во всех файлах
    let totalPages = 0;
    let processedPages = 0;

    for (const file of files) {
      try {
        const pdfData = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        totalPages += pdfDoc.numPages;
      } catch (error) {
        console.error(`Ошибка при подсчете страниц в файле ${file.name}:`, error);
      }
    }

    for (const file of files) {
      try {
        const fileDate = extractDateFromFilename(file.name);
        if (!fileDate) {
          console.error(`Неверный формат даты в имени файла: ${file.name}`);
          continue;
        }

        const pdfData = await file.arrayBuffer();
        const pages = await convertPdfToImages(pdfData);

        for (let i = 0; i < pages.length; i++) {
          const pageImage = pages[i];
          const text = await extractTextWithTesseract(pageImage);
          const results = parsePdfData(text, fileDate);
          parsedData.push(...results.map(result => ({
            ...result,
            Дата: fileDate
          })));

          processedPages++;
          updateProgress(processedPages, totalPages);
        }
      } catch (error) {
        console.error(`Ошибка обработки файла ${file.name}:`, error);
      }
    }
    onFileDownloaded();
    exportToExcel(parsedData, "Medical_Analysis");
    setLoading(false);
  };

  const addIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: {
        ...prev[standardName],
        variants: [...(prev[standardName]?.variants || []), variant]
      }
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
          <p>Обработано страниц: {processedFiles} из всех документов</p>
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