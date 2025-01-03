import fetch from 'node-fetch';
import fs from'fs';
(async () => {

    
  
    
   
    const resolutionMapping = {
        HD: 'HD',
        SD: 'SD',
        ᵁᴴᴰ: 'HD',
        '4K': '4K',
        UHD: '4K',
        FULL: 'FULL',
        FHD: 'FHD',
        '4K UHD': '4K',
        ᴴᴰ: 'HD',
        '𝐻𝒟': 'HD',
        '𝗛𝗗': 'HD',
        ＨＤ: 'HD',
        '🅷🅳': 'HD',
        '𝐇𝐃': 'HD',
        ˢᴰ: 'SD',
        '４Ｋ': '4K',
        '𝟜𝐾': '4K',
        '𝟒𝗞': '4K'
    };
    const resolutionarray = [
        'HD', 'SD', 'ᵁᴴᴰ', '4K', 'UHD', 'FULL', 'FHD', '4K UHD', 'ᴴᴰ', '𝐻𝒟', '𝗛𝗗', 'ＨＤ', 
        '🅷🅳', '𝐇𝐃', 'ˢᴰ', '４Ｋ', '𝟜𝐾', '𝟒𝗞'
    ];

    const languages = [
        "FA", "ALB", "ES", "BN", "BANGLA", "BENGALI", "FR", "NL", "DE", "BR", "PT", 
        "ZH", "AR", "HI", "EN", "GUJARATI", "KANNADA", "MARATHI", "MALAYALAM", 
        "ODIA", "TAMIL", "TELUGU", "PUNJABI", "HE", "JA", "HA", "YO", "IG", 
        "UR", "PA", "RU", "SI", "TA", "IT","SP","KURDI"
    ];

    const regions = [
        "FA", "ALB", "ALG", "ANGOLA", "ES", "ARG", "ARM", "AU", "AT", "AZE", 
        "BN", "BANGLA", "BENGALI", "FR", "NL", "DE", "BE", "BENIN", "BG", 
        "BR", "PT", "BG", "BURKIN", "BURK", "CAM", "CAPEVERDE", "CL", "ZH", 
        "CN", "CO", "CY", "CZ", "DK", "DJIBOUTI", "EC", "AR", "EGYPT", 
        "EE", "ERITREA", "ETH", "FI", "FR", "DE", "GH", "GR", "GUINEE", 
        "HU", "HI", "EN", "GUJARATI", "KANNADA", "MARATHI", "MALAYALAM", 
        "ODIA", "TAMIL", "TELUGU", "PUNJABI", "INDIA", "ID", "IR", "FA", 
        "IRAN", "AR", "IRAQ", "HE", "AR", "IT", "JA", "JP", "AR", "JOR", 
        "KE", "KR", "KRD", "AR", "KU", "KWT", "LV", "AR", "LBN", "LYB", 
        "LT", "LU", "MAK", "FR", "MALI", "MT", "ES", "MX", "MNE", "MA", 
        "MY", "NA", "NU", "NL", "NZ", "EN", "HA", "YO", "IG", "NG", 
        "NIGERIA", "NO", "AR", "OMAN", "UR", "PA", "PK", "PY", "PE", 
        "PH", "PL", "PT", "AR", "QTR", "RO", "RU", "RUS", "ROWANDA", 
        "AR", "KSA", "SEN", "SRB", "SIERRALEONE", "SK", "SLOV", "SOMALIA", 
        "AF", "EN", "ZU", "ES", "ESP", "SI", "TA", "LK", "SUD", "SV", 
        "FR", "DE", "IT", "SYR", "TW", "TWN", "TZ", "TUN", "TR", "UG", 
        "UK", "RUS", "AR", "UAE", "EN", "UK", "EN", "US", "UY", "VE", 
        "VI", "VIA", "YEMEN", "ZM", "ZW","KOREA","TUNISIE","AFGHANISTAN", "ALBANIA", "ALGERIA", "ANGOLA", "ARGENTINA", "ARMENIA",
    "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BANGLADESH", "BELGIUM", "BENIN",
    "BOSNIA", "BRAZIL", "BULGARIA", "BURKINA FASO", "CAMBODIA", "CAPE VERDE",
    "CHILE", "CHINA", "COLOMBIA", "CYPRUS", "CZECH REPUBLIC", "DENMARK",
    "DJIBOUTI", "ECUADOR", "EGYPT", "ESTONIA", "ERITREA", "ETHIOPIA",
    "FINLAND", "FRANCE", "GERMANY", "GHANA", "GREECE", "GUINEA", "HUNGARY",
    "INDIA", "INDONESIA", "IRAN", "IRAQ", "ISRAEL", "ITALY", "JAPAN",
    "JORDAN", "KENYA", "KOREA", "KURDISTAN", "KUWAIT", "LATVIA", "LEBANON",
    "LIBYA", "LITHUANIA", "LUXEMBOURG", "MACEDONIA", "MALI", "MALTA",
    "MEXICO", "MONTENEGRO", "MOROCCO", "MYANMAR", "NAMIBIA", "NEPAL",
    "NETHERLANDS", "NEW ZEALAND", "NIGERIA", "NORWAY", "OMAN", "PAKISTAN",
    "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "QATAR",
    "ROMANIA", "RUSSIA", "RWANDA", "SAUDI ARABIA", "SENEGAL", "SERBIA",
    "SIERRA LEONE", "SLOVAKIA", "SLOVENIA", "SOMALIA", "SOUTH AFRICA",
    "SPAIN", "SRI LANKA", "SUDAN", "SWEDEN", "SWITZERLAND", "SYRIA",
    "TAIWAN", "TANZANIA", "TUNISIA", "TURKEY", "UGANDA", "UKRAINE",
    "UNITED ARAB EMIRATES", "UNITED KINGDOM", "UNITED STATES", "URUGUAY",
    "VENEZUELA", "VIETNAM", "YEMEN", "ZAMBIA", "ZIMBABWE"
    ];
    // List of country names in uppercase
const countries = [
    "AFGHANISTAN", "ALBANIA", "ALGERIA", "ANGOLA", "ARGENTINA", "ARMENIA",
    "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BANGLADESH", "BELGIUM", "BENIN",
    "BOSNIA", "BRAZIL", "BULGARIA", "BURKINA FASO", "CAMBODIA", "CAPE VERDE",
    "CHILE", "CHINA", "COLOMBIA", "CYPRUS", "CZECH REPUBLIC", "DENMARK",
    "DJIBOUTI", "ECUADOR", "EGYPT", "ESTONIA", "ERITREA", "ETHIOPIA",
    "FINLAND", "FRANCE", "GERMANY", "GHANA", "GREECE", "GUINEA", "HUNGARY",
    "INDIA", "INDONESIA", "IRAN", "IRAQ", "ISRAEL", "ITALY", "JAPAN",
    "JORDAN", "KENYA", "KOREA", "KURDISTAN", "KUWAIT", "LATVIA", "LEBANON",
    "LIBYA", "LITHUANIA", "LUXEMBOURG", "MACEDONIA", "MALI", "MALTA",
    "MEXICO", "MONTENEGRO", "MOROCCO", "MYANMAR", "NAMIBIA", "NEPAL",
    "NETHERLANDS", "NEW ZEALAND", "NIGERIA", "NORWAY", "OMAN", "PAKISTAN",
    "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "QATAR",
    "ROMANIA", "RUSSIA", "RWANDA", "SAUDI ARABIA", "SENEGAL", "SERBIA",
    "SIERRA LEONE", "SLOVAKIA", "SLOVENIA", "SOMALIA", "SOUTH AFRICA",
    "SPAIN", "SRI LANKA", "SUDAN", "SWEDEN", "SWITZERLAND", "SYRIA",
    "TAIWAN", "TANZANIA", "TUNISIA", "TURKEY", "UGANDA", "UKRAINE",
    "UNITED ARAB EMIRATES", "UNITED KINGDOM", "UNITED STATES", "URUGUAY",
    "VENEZUELA", "VIETNAM", "YEMEN", "ZAMBIA", "ZIMBABWE"
];
// Define types to filter
const typeCategories = ["KID", "MUSIC", "CINEMA", "SPORT","DOCUMENTAIRE","NEWS"];


//#region this process get the categories
// Function to fetch categories
 async function fetchCategories() {
    let  outputData
    try {
        const response = await fetch('http://763025459169.cdn-fug.com:8080/player_api.php?username=115763054352463&password=iuadobbh3v&action=get_live_categories');
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        const categories = await response.json();

        // Trim, Normalize and Filter Categories
        const cleanedCategories = categories.map(category => ({
            category_id: category.category_id,
            category_name: category.category_name.toUpperCase().trim(), // Normalize
            parent_id: category.parent_id
        }));

        // Filter categories for country
        const countryCategories = cleanedCategories
            .map(category => {
                // Check if category name includes any country name
                const matchingCountry = countries.find(country => category.category_name.includes(country));
                return matchingCountry ? {
                    category_id: category.category_id,
                    category_name: matchingCountry, // Use the matched country name
                    parent_id: category.parent_id
                } : null; // Return null if no match is found
            })
            .filter(category => category !== null); // Filter out null values

        // Filter categories for type
        const typeFilteredCategories = cleanedCategories
            .map(category => {
                // Check if category name includes any type
                const matchingType = typeCategories.find(type => category.category_name.includes(type));
                return matchingType ? {
                    category_id: category.category_id,
                    category_name: matchingType, // Use the matched type name
                    parent_id: category.parent_id
                } : null; // Return null if no match is found
            })
            .filter(category => category !== null); // Filter out null values

        // Filter categories for language
        const languageCategories = cleanedCategories
            .map(category => {
                // Check if category name starts with any language code
                const matchingLang = languages.find(lang => category.category_name.startsWith(lang));
                return matchingLang ? {
                    category_id: category.category_id,
                    category_name: matchingLang, // Use the matched language code
                    parent_id: category.parent_id
                } : null; // Return null if no match is found
            })
            .filter(category => category !== null); // Filter out null values

        // Output the results to the console
         outputData = {
            countryCategories: countryCategories,
            typeCategories: typeFilteredCategories,
            languageCategories: languageCategories
        };

        // Save to output.json
       

    } catch (error) {
        console.error('Error fetching categories:', error);
    }
    return outputData
}

// Run the fetchCategories function
 let cats= await fetchCategories();
 console.log("fetch categories proccess 1 done")

//#endregion

//#region this region filter according to the sam num  
    // Read the checkpoint file
    
    const checkpointFile = 'C1.json';
    let checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    let  groups  = checkpoint.groups;
    let number=0
    // Function to remove duplicate channels by their `.num` property
    function removeDuplicateChannelsByNum(groups) {
        const seenNums = new Set();
        return groups.map(group => {
            const uniqueChannels = group.filter(channel => {
                number++;
                if (!channel.num || seenNums.has(channel.num)) {
                    return false; // Skip duplicates
                }
                seenNums.add(channel.num); // Mark the number as seen
                return true; // Keep the first occurrence
            });
            return uniqueChannels;
        });
    }

    // Call the function to remove duplicates
    const cleanedGroups = removeDuplicateChannelsByNum(groups);

    // Save the cleaned groups back to the checkpoint file
    
    console.log("Duplicate channels removed and saved to  Process 2 done N="+number);




 //#endregion

//#region this region do the maping 
    
    groups  = cleanedGroups;

    function getLanguageFromEpgId(epgChannelId, region) {
        // Safeguard for null or undefined epgChannelId
        if (!epgChannelId) {
            return languages.includes(region) ? region : 'EN'; // Default to region or 'EN'
        }
        const languageCode = epgChannelId.split('.').pop().toUpperCase();
        return languages.includes(languageCode) ? languageCode : 'EN'; // Default to 'EN' if not found
    }

    function extractResolution(name) {
        for (let key in resolutionMapping) {
            if (name.includes(key)) {
                return resolutionMapping[key];
            }
        }
        return 'HD'; // Default resolution
    }

    function determineUTC(name) {
        const utcMatch = name.match(/([+-]\d+)/);
        return utcMatch ? utcMatch[0] : ''; // Extract UTC if present
    }

    function formatName(name) {
        return name.replace(/\|\|/g, ' ').trim();
    }

    function getRegionFromName(name) {
        const nameParts = name.split('|');
        for (let part of nameParts) {
            part = part.trim().toUpperCase();
            if (regions.includes(part)) {
                return part; // Return the first valid region code
            }
        }
        return ''; // Return empty string if no region is found
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
    }
    function normalizeName(name) {
        // Replace "|" with spaces and trim the string
        name = name.replace(/\|/g, ' ').trim();
        
        // Remove region codes from the name
        regions.forEach(region => {
            const regex = new RegExp(`\\b${region}\\b`, 'gi');
            name = name.replace(regex, '').trim();
        });
    
        resolutionarray.forEach(res => {
            const escapedRes = escapeRegExp(res); // Escape any special characters in the resolution string
            const regex = new RegExp(`${escapedRes}`, 'gi'); // Use the escaped string, not wrapped in word boundary
            name = name.replace(regex, '').trim(); // Remove the resolution from the name
        });
    
        // Remove UTC offsets (like +1, -3)
        name = name.replace(/[+-]\d+/, '').trim();
    
        return name;
    }
    
    function findMostCommonSequence(names, minPercentage) {
        const subsequenceCounts = {}; // Object to store subsequences and their counts
        const totalNames = names.length; // Total number of names
    
        //console.log(`Total names: ${totalNames}`);
    
        // Generate all subsequences for each name
        for (const name of names) {
            const normalizedName = normalizeName(name); // Normalize each name
            const subsequences = generateSubsequences(normalizedName); // Get subsequences
    
            //console.log(`Normalized name: "${normalizedName}" -> Subsequences:`, subsequences);
    
            // Count occurrences of each subsequence
            for (const subsequence of subsequences) {
                if (!subsequenceCounts[subsequence]) {
                    subsequenceCounts[subsequence] = new Set(); // Initialize set for unique names
                }
                subsequenceCounts[subsequence].add(normalizedName); // Add name to the set
            }
        }
    
        // Convert subsequence counts to an array and sort by frequency
        const sortedSubsequences = Object.entries(subsequenceCounts).sort(
            (a, b) => b[1].size - a[1].size // Sort by frequency of subsequences (size of set)
        );
    
        // Prepare results: subsequence, its count, and percentage of appearance
        const mostCommonSubsequences = sortedSubsequences.map(([subsequence, namesSet]) => {
            const percentage = ((namesSet.size / totalNames) * 100).toFixed(2); // Percentage of names containing the subsequence
            return { subsequence, count: namesSet.size, percentage: `${percentage}%`, length: subsequence.length }; // Add subsequence length
        });
    
        // Filter results based on the minimum percentage threshold (minPercentage)
        const filteredResults = mostCommonSubsequences.filter(subseq => parseFloat(subseq.percentage) >= minPercentage);
    
        // Sort the filtered results by the length of the subsequence (longest first) and then by count
        const sortedByLength = filteredResults.sort((a, b) => b.length - a.length || b.count - a.count);
    
        // Debug: Log the filtered and sorted subsequences
       // console.log(`Filtered and sorted subsequences (min percentage: ${minPercentage}%):`, sortedByLength);
    
       let notallow=["","TV","FRANCE 2"]
   
    function isDigit(str) {
        return /^\d+$/.test(str);
    }
   let good= (sortedByLength)=>{
        let pointer=0; let g; let isnotok
         do {g= sortedByLength[pointer]?.subsequence
            isnotok=(isDigit(sortedByLength[pointer]?.subsequence)||notallow.includes(sortedByLength[pointer]?.subsequence))
         if (isnotok) pointer++
       // console.log(g,"",pointer,"",sortedByLength,"",isnotok)
        }
        while(isnotok);
    return g;}
    return good(sortedByLength)
    }
    
  
    // Helper function to generate all subsequences of a name
    function generateSubsequences(name) {
        const words = name.split(/\s+/); // Split the name into words
        const subsequences = new Set();
    
        // Generate all possible subsequences
        for (let i = 0; i < words.length; i++) {
            let subsequence = '';
            for (let j = i; j < words.length; j++) {
                subsequence += (subsequence ? ' ' : '') + words[j];
                subsequences.add(subsequence); // Add subsequence to set
            }
        }
    
        return [...subsequences]; // Return unique subsequences
    }
   
    
    
    // Example relevance check function
    function isRelevantSequence(sequence) {
        const relevantKeywords = ['NEWS', 'SPORTS', 'MOVIES', 'MUSIC', 'KIDS']; // Define relevant keywords
        const words = sequence.toUpperCase().split(' '); // Normalize to uppercase
    
        // Check if the sequence contains any relevant keyword
        return words.some(word => relevantKeywords.includes(word));
    }
    
    
    
    function removeTrailingH(name) {
        // Use a regular expression to remove the trailing ' H' with any additional spaces
        return name.replace(/\s+H$/, '').trim();
    }
    
    function transformGroupsToChannels(groups) { 
        let result = [];
    
        // Outer loop for each group (i)
        for (let i = 0; i < groups.length; i++) {
            let channelLogos = []; // Unique logos
            let categories = []; // Unique categories
            let total = 0;
            let ports = [];
            let logoMap = {}; // Map to link ports and their logos
            
            // Middle loop for each channel in the group (j)
            for (let j = 0; j < groups[i].length; j++) {
                const channel = groups[i][j];
    
                const normalizedChannelName = removeTrailingH(normalizeName(channel.name));
                const region = getRegionFromName(channel.name);
                const language = getLanguageFromEpgId(channel.epg_channel_id, region);
                const resolution = extractResolution(channel.name);
                const utc = determineUTC(channel.name);
                 // Map logos to the ports, using a unique index (like stream_id or indexer)
               
                 
                const port = {
                    name:  normalizedChannelName.toUpperCase(),
                    region: region,
                    language:language,
                    resolution: resolution,
                    utc: utc,
                    indexer: channel.stream_id.toString(),
                    ok: true
                    
                };
                if (channel.stream_icon) {
                    logoMap[port.indexer] = channel.stream_icon;
                }
                let cat;
                if (channel.category_id) {
                    categories.push(channel.category_id);
                    cat =channel.category_id
                }
                function getCountryByCategoryId(category_id) {
                    const category = cats.countryCategories.find(item => item.category_id === category_id);
                    return category ? category.category_name : undefined;
                  }
                  function getLangByCategoryId(category_id) {
                    const category = cats.languageCategories.find(item => item.category_id === category_id);
                    return category ? category.category_name : undefined;
                  }
                  if(getCountryByCategoryId(cat))port.region=getCountryByCategoryId(cat)
                  if(getLangByCategoryId(cat))port.region=getLangByCategoryId(cat)
                  
                ports.push(port);
    
               
    
                
            }
            function getTypeCategoryId(category_id) {
                const category = cats. typeCategories.find(item => item.category_id === category_id);
                return category ? category.category_name : undefined;
              }
              function findMostRepeatedKeyword(keywords) {
                const keywordCounts = {};
            
                // Count the occurrences of each keyword
                for (const keyword of keywords) {
                    if (keywordCounts[keyword]) {
                        keywordCounts[keyword]++;
                    } else {
                        keywordCounts[keyword] = 1;
                    }
                }
            
                // Find the most repeated keyword
                let mostRepeated = null;
                let maxCount = 0;
            
                for (const keyword in keywordCounts) {
                    if (keywordCounts[keyword] > maxCount) {
                        maxCount = keywordCounts[keyword];
                        mostRepeated = keyword;
                    }
                }
            
                return mostRepeated;
            }
            
           
              
            // Extract the most common name across all ports
            const portNames = ports.map(port => removeTrailingH(port.name) );
           
            const mostCommonName = findMostCommonSequence(portNames,10)?.toUpperCase();
            //console.log (portNames)

            
            
            // Filter ports that match the most common name
            const filteredPorts = ports.filter(port => port.name.includes(mostCommonName));
    
            // Filter logos: Only keep the logos of the remaining ports
            const filteredLogos = filteredPorts.map(port => logoMap[port.indexer]).filter(Boolean);
            let category=findMostRepeatedKeyword(Array.from(new Set(categories)).map(cat=>cat=getTypeCategoryId(cat)))
          
function findFirstContainedString(typeCategories, mostCommonName) {
    return typeCategories.find(str => mostCommonName.includes(str)) || null;
}
if (!category) category=findFirstContainedString(typeCategories, mostCommonName)

const firstContainedString = findFirstContainedString(typeCategories, typeCategories)

            // Push the final channel object to the result array
            result.push({
                name: mostCommonName,
                total: filteredPorts.length,
                category: category , // Ensure unique categories
                logos: Array.from(new Set(filteredLogos)), // Ensure unique logos
                ports: filteredPorts
            });
        }
       
       
        result = result.filter(channel => 
            channel.total !== 0 && 
            !(
                channel.name.includes(":") ||
                channel.name.includes("(") ||
                channel.name.includes(")") ||
                channel.name.includes("&") ||
                channel.name.includes("!") ||
                channel.name.includes("-") ||
                channel.name.includes(".") ||
                channel.name.includes("VS") ||
                channel.name.includes("✦") ||
                channel.name.includes("●") ||
                channel.name.includes("[") ||
                channel.name.includes("]") ||
                channel.name.includes("_") ||
                channel.name.includes("*") ||
                channel.name.includes("'") ||
                channel.name.includes("()")

            )&&channel.logos.length!== 0
        );
        
        return result;
    }
    

    const transformedChannels = transformGroupsToChannels(groups);

    // Save the transformed channels to a file or log them
    const outputFile = '3.json';
    fs.writeFileSync(outputFile, JSON.stringify(transformedChannels, null, 2));

    console.log('Transformation completed and saved to', outputFile,"N= ",transformedChannels.length);

//#endregion

})();