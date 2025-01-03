import { useLayoutEffect,useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import {
   Box, Button, CircularProgress, CircularProgressLabel,
  Container, Flex, Heading, Image, Spinner, Text, useToast,
  useColorModeValue, Modal, ModalOverlay, ModalContent,
  ModalCloseButton, ModalBody, VStack, Collapse, Center,
  Badge,Select,
  HStack
} from "@chakra-ui/react";
import { CalendarIcon, CheckCircleIcon, DownloadIcon,SmallAddIcon, TimeIcon } from "@chakra-ui/icons";
import {
  fetchCredits, fetchDetails,  imagePathOriginal,getSerieInfo,fetchEpisodeDetails,

} from "../../services/api";
import {
  minutesTohours, ratingToPercentage, resolveRatingColor
} from "../../../../function/helpers";
import { useAuth } from "../../context/useAuth";
import { useTransaction } from "../../context/TransactionContext";
import DownloadButton from "../../components/DownloadButton";
import ArtPlayerComponent from "../../components/player2";




const Serie = () => {
  const { id, tmdb } = useParams();
  const { checkIfInTaste, updateTaste, user, getByTmdbOrImagePath } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imagePath = decodeURIComponent(params.get("imgPath"));
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isInTaste, setIsInTaste] = useState(false);
  const [isOpen, setIsOpen] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const {createDownloadTransactionSingle}=useTransaction()
 
  const [seasons, setSeasons] = useState([]);

  const [selectedSeason, setSelectedSeason] = useState(null);

  // Set background colors based on color mode
  const mainTextColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("yellow.600", "yellow.400");
  const overlayColor = useColorModeValue("rgba(255,255,255,0.88)", "rgba(0,0,0,0.88)");
 
  // Load watching data from localStorage only once on mount
const initialWatchingData = JSON.parse(localStorage.getItem("watchingData")) || {
  movies: [],
  series: [],
};
const [watchingData, setWatchingData] = useState(initialWatchingData);


const handleDownload = async (allow ,sid,mid) => {
    
  try {
    const result = await createDownloadTransactionSingle({ SerieId:sid, movieId:mid, allow });
    if (result === true) {
      // Successful download
      toast({
        title: "Download successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDownloaded(true)
    } else if (result === false) {
      // Download requires payment confirmation
      toast({
        title: "Vous avez épuisé votre téléchargement.",
        description: "Cliquez pour confirmer le paiement avec votre solde.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        onCloseComplete: async () => {
          const confirm = window.confirm("Voulez-vous payer avec votre solde pour télécharger ?");
          if (confirm) {
            await handleDownload(true,sid,mid);
            setIsDownloaded(true)
          }
        }
      });
    } else {
      // Undefined or failed download
      toast({
        title: "Échec du téléchargement.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    toast({
      title: "Une erreur s'est produite.",
      description: "Veuillez réessayer plus tard.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } 
};
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch details and credits in parallel
      const [detailsData, creditsData] = await Promise.all([
        fetchDetails("tv", tmdb),
        fetchCredits("tv", tmdb),
      ]);
      setWatchingData(initialWatchingData);
      setDetails(detailsData);
      const isd= !!user.downloads.find(d=>d.SerieId===id)
      setIsDownloaded(isd)
      // Check if the item is in taste and retrieve similar series
      const [inTaste, similarSeriesData] = await Promise.all([
        checkIfInTaste(id, "series"),
        getByTmdbOrImagePath(tmdb, imagePath, "series"),
      ]);

      setIsInTaste(inTaste);

      // Fetch info for each similar series only once
      const similarSeriesInfo = await Promise.all(
        similarSeriesData.map(async (serie) => {
          try {
            const serieInfo = await getSerieInfo(id);
            return serieInfo.episodes;
          } catch (error) {
            console.error(`Error fetching data for serie ${serie.serieId}:`, error);
            return [];
          }
        })
      );
      


      // Merge details and fetched season data
      let mergedData = detailsData.seasons.map((season, index) => {
        const seasonIndex = parseInt(season.name.split(" ")[1]); // Extract season index
        const apiseasonall = similarSeriesInfo.map((serie) => serie[seasonIndex] || []);
        return { ...season, apiseasonall };
      });
      if (mergedData[0].name==="Épisodes spéciaux")
        mergedData=mergedData.slice(1)
      setSeasons(mergedData);
    
      setSelectedSeason(mergedData[0]);

    } catch (error) {
      console.error("Error fetching episode details:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id, user, checkIfInTaste, getByTmdbOrImagePath, tmdb]);



  const handleAddToTaste = async () => {
    if (!user) {
      toast({ title: "Login to add to your list", status: "error", isClosable: true });
      return;
    }
    await updateTaste(null, id, true);
    setIsInTaste(true);
    toast({ title: "Added to your list", status: "success", isClosable: true });
  };
  
  const handleRemoveFromTaste = async () => {
    await updateTaste(null, id, false);
    setIsInTaste(false);
    toast({ title: "Removed from your list", status: "info", isClosable: true });
  };
  const handleSeasonChange = (event) => {
    const selectedSeasonId = event.target.value;
    //console.log(event.target.value)
    setSelectedSeason(seasons.find(season => season.id == selectedSeasonId));
  };
  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  const title = details?.name || details?.title;
  const releaseDate = details?.first_air_date || details?.release_date;

  return (
    <Box color={mainTextColor} w="100%" h="100vh">
      {/* Background */}
      <Box
        background={`linear-gradient(${overlayColor}, ${overlayColor}), url(${imagePathOriginal}/${details?.backdrop_path})`}
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundPosition="center"
        position="fixed"
        top="0"
        left="0"
        w="100%"
        h="100%"
        zIndex={-1}
       
      />
      <Container maxW="container.xl" pt={20} margin={1}>
        <Flex alignItems="center" gap="10" flexDirection={{ base: "column", lg: "row" }}>
          <Image height="450px" borderRadius="sm" src={`${imagePathOriginal}/${details?.poster_path}`} alt={title} />
          <Box>
            <Heading fontSize="3xl" mb={2}>
              {title}{" "}
              <Text as="span" fontWeight="normal" color={secondaryTextColor}>
                {new Date(releaseDate).getFullYear()}
              </Text>
            </Heading>
            <Flex alignItems="center" gap="4" mt={1} mb={5}>
              <CalendarIcon mr={2} color={secondaryTextColor} />
              <Text fontSize="sm">{new Date(releaseDate).toLocaleDateString("fr-FR")} (FR)</Text>
              <TimeIcon mr="2" color={secondaryTextColor} />
              <Text fontSize="sm">{minutesTohours(details?.episode_run_time?.[0])}</Text>
            </Flex>
            
            {/* Circular Rating */}
            <CircularProgress
              value={ratingToPercentage(details?.vote_average)}
              bg="transparent"
              borderRadius="full"
              p="0.5"
              size="70px"
              color={resolveRatingColor(details?.vote_average)}
              thickness="6px"
            >
              <CircularProgressLabel fontSize="lg">
                {ratingToPercentage(details?.vote_average)} <Box as="span" fontSize="10px">%</Box>
              </CircularProgressLabel>
            </CircularProgress>

            {/* Taste Button */}
            <Button
              leftIcon={isInTaste ? <CheckCircleIcon /> : <SmallAddIcon />}
              variant="outline"
              onClick={isInTaste ? handleRemoveFromTaste : handleAddToTaste}
              colorScheme={isInTaste ? "green" : "gray"}
              pr={10}
              pl={8}
            >
              {isInTaste ? "Dans My List" : "My List"}
            </Button>
            {!isDownloaded? (   <DownloadButton
               sid={id}
               id={null}
               createDownloadTransactionSingle={createDownloadTransactionSingle}
              ></DownloadButton>  ) : ( <Button leftIcon={<CheckCircleIcon />} colorScheme="green" variant="outline" onClick={handleRemoveFromTaste}>Telecharger</Button>
                 )}
            <Heading fontSize="xl" mb="3">Résumé</Heading>
              <Text fontSize="md" mb="3">{details?.overview}</Text>
              <Flex mt={6} gap={2} flexWrap="wrap">
              {details?.genres?.map((genre) => (
                <Badge key={genre.id} p={1} bg={secondaryTextColor} color="white">{genre.name}</Badge>
              ))}
            </Flex>
          </Box>
          
        </Flex>
        
        <Flex flexDirection="column" alignItems="flex-start" >
      <Box mb={4}>
        <Badge colorScheme="red" fontSize="lg">
          {seasons.length} Seasons
        </Badge>
      </Box>
      <HStack>
      <Select
        onChange={handleSeasonChange}
        placeholder="Choisir Saison"
        value={selectedSeason} // Ensure the selected season stays active
        mb={4}
        bg="red.600"
        _hover={{ bg: "red.700" }}
        color="white"
        width={"100%"}
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id} style={{ color: "black" }}  width={"100%"}>
            {season.name}
          </option>
        ))}
      </Select>
      </HStack>

      {selectedSeason && (
        <VStack spacing={6} width={"100%"}>
          {/* Render the selected season's details */}
          <Season season={selectedSeason} seriesId={tmdb} id={id} watchingData={watchingData} isOpen={isOpen} setIsOpen={setIsOpen} isDownloaded={isDownloaded} />
        </VStack>
      )}
    </Flex>

      </Container>
     
    </Box>
  );
};

export default Serie;















// Season Component
// Season Component
const Season = ({ season, seriesId,watchingData,isOpen,setIsOpen,id,isDownloaded}) => {
  const currentSeasonData = useMemo(() => 
    watchingData?.series.find((s) => s.tmdb === seriesId)?.season.find((s) => s.seasonNum === season.season_number), 
    [watchingData, seriesId, season]
  );
  
  const [episodes, setEpisodes] = useState([]);
  
  useEffect(() => {
    if (!season || !season.apiseasonall) return;
  
    const totalEpisodes = parseInt(season.episode_count);
    
    // Create a single-level array of all episodes, ensuring each episode is stored only once
    const episodess = Array.from({ length: totalEpisodes }, (_, index) => {
      const episodeList = [];
      season.apiseasonall.forEach((subArray) => {
        if (subArray?.[index]) episodeList.push(subArray[index]);
      });
      return episodeList;
    });
    const filteredEpisodes = episodess
  .filter((episodeList) => episodeList.length > 0) // Filter out empty arrays
  .map((episodeList) => {
    const uniqueEpisodes = new Map(); // To track unique episodes by `id`
    episodeList.forEach((episode) => {
      if (!uniqueEpisodes.has(episode.id)) {
        uniqueEpisodes.set(episode.id, episode);
      }
    });
    return Array.from(uniqueEpisodes.values()); // Return unique episodes
  });

//console.log(filteredEpisodes);

  
    setEpisodes(filteredEpisodes);
    
  }, [season]);
  
      
   

  return (
    <Box w="100%" border="1px solid" borderColor="gray.200" p={4} borderRadius="md">
      <Text fontSize="xl" color="red.500">
        {season.name}
      </Text>

      <VStack spacing={3} align="start">
        <Text fontWeight="bold" fontSize="md" color="gray.500">
          {season.episode_count} Episodes
        </Text>

        {Array.from({ length: season.episode_count }).map((_, index) => {
          const episodeWatchingData = currentSeasonData?.episodes?.find(
            (ep) => ep.episodeNum === index + 1
          );
          

          return (
            <Episode
              key={index}
              seriesId={seriesId}
              seasonNumber={season.season_number}
              episodeNumber={index + 1}
              watchingData={episodeWatchingData}
              episodes={episodes[index]}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              id={id}
              isDownloaded={isDownloaded}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

const Episode = ({ seriesId, seasonNumber, episodeNumber, watchingData, episodes, isOpen, setIsOpen,id,isDownloaded }) => {
  const [episodeDetails, setEpisodeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serveurSelectionné, setServeurSelectionné] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const [StreamingAccess, setStreamingAccess] = useState(undefined);
  const { streamingserverurl, user } = useAuth();

  useLayoutEffect(() => {
    const access = {
      username: !!user?.StreamingAccess?.username?.trim() ? user.StreamingAccess.username : null,
      password: !!user?.StreamingAccess?.username?.trim() ? user.StreamingAccess.password : null,
    };
    setStreamingAccess(access);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchEpisodeDetails(seriesId, seasonNumber, episodeNumber); // Assume fetchEpisodeDetails is defined
        setEpisodeDetails(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId, seasonNumber, episodeNumber]);


//const dataInfo={
 //   type:"series",
   // seasonNum: seasonNumber,
   // episodeNum: episodeNumber,
   // id: id,
  //}
  // Calculate progress
  const isWatched = watchingData?.isFinished;
  const progressPercentage = isWatched
    ? 100
    : Math.min((watchingData?.watchingTimeInMin / watchingData?.totalTime) * 100, 100);

  const boxBg = useColorModeValue("gray.100", "black");
  const boxColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.300", "gray.500");
  const hoverBg = useColorModeValue("white", "gray.600");

  if (loading) {
    return (
      <Flex justify="center" align="center" width="100%">
        <Spinner size="sm" color="red.500" />
      </Flex>
    );
  }

  if (!(StreamingAccess && StreamingAccess?.username && StreamingAccess?.password)) return <></>;

  if (episodes)return (
    <Box
      width="100%"
      mt={2}
      p={2}
      border="1px solid"
      borderColor={borderColor}
      sx={{
        overflowY: 'auto',
        overscrollBehavior: 'none', // Disable overscroll
      }}
      borderRadius="md"
      boxShadow="md"
      _hover={{ transform: "scale(1.05)", transition: "transform 0.2s", bg: hoverBg }}
      display="flex"
      flexDirection={{ base: "column", md: "column" }}
      bg={boxBg}
      color={boxColor}
      position="relative"
      onClick={() => setIsOpen(seriesId + seasonNumber + episodeNumber)}
      onMouseEnter={() => setIsOpen(seriesId + seasonNumber + episodeNumber)}
      onMouseLeave={() => setIsOpen(null)}
    >
      {/* Episode Poster */}
      
        
      
      {/* Episode Details */}
      <VStack align="start" spacing={1} wordBreak={"break-all"} >
      {episodeDetails?.still_path&& <Image
          src={`https://image.tmdb.org/t/p/w500${episodeDetails?.still_path}`}
          alt={episodeDetails?.name}
          objectFit="cover"
          height={{ base: "80px", md: "150px" }} 
          width={{ base: "160px", md: "350px" }}
          borderRadius="md"
        />}
       <Text fontWeight="bold" fontSize={{ base: "md", lg: "lg" }} color="red.500">
          Episode {episodeNumber}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} color={boxColor} noOfLines={3}>
          {episodeDetails?.overview}
        </Text>
        <Text fontSize="xs" color="gray.600">
          Air Date: {episodeDetails?.air_date}
        </Text>
      </VStack>

      {/* Progress Bar for Episode Watching Progress */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        width={`${progressPercentage}%`}
        height="4px"
        bg="green.500"
        borderRadius="md"
      />

      {/* Collapse for episode servers */}
      <Collapse in={isOpen === seriesId + seasonNumber + episodeNumber} animateOpacity>
        <VStack align="stretch" width="100%" mt={4} maxH="50px" overflowY="auto"
         sx={{
          /* Custom scrollbar styles */
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#3182ce',
            borderRadius: '8px',
            border: '2px solid #fff', // Adds a border around the thumb
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#2b6cb0', // Change the color when hovered
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '8px',
          },
        }}>
          {episodes?.map((film, index) => (
            <Button
              key={index}
              value={film.id}
              width="100%"
              colorScheme={selectedValue === film.id ? "blue" : "gray"}
              bg={selectedValue === film.id ? "blue.500" : "gray.100"}
              color={selectedValue === film.id ? "white" : "black"}
              _hover={{ bg: selectedValue === film.id ? "blue.600" : "gray.200" }}
              onClick={() => {
                setServeurSelectionné(film);
                setSelectedValue(film.id);
              }}
            >
              Regarder {index + 1} {film.name} {film.container_extension}
            </Button>
          ))}
        </VStack>
      </Collapse>

      {/* Modal for streaming */}
      {serveurSelectionné && (
        <Modal isOpen={!!serveurSelectionné} onClose={() => setServeurSelectionné(null)} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(5px)" />
          <ModalContent
           // display="flex"
           // alignItems="center"
           // justifyContent="center"
            maxW="90vw"
            maxH="90vh"
            background="transparent"
            margin="auto"
           // position="relative"
          >
            <ModalCloseButton
              //position="absolute"
              top="10px"
              right="10px"
              zIndex={11}
              color="white"
              bg="rgba(0, 0, 0, 0.5)"
              _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
              borderRadius="full"
            />
            <ModalBody p={0} >
              {serveurSelectionné && (
               <ArtPlayerComponent canDownload={isDownloaded} videourl={`${streamingserverurl}/series/${user.StreamingAccess.username}/${user.StreamingAccess.password}/${serveurSelectionné.id}.${serveurSelectionné.container_extension}`} extension={serveurSelectionné.container_extension}></ArtPlayerComponent>
              )}                                             
            </ModalBody>
          </ModalContent>
        </Modal>
)}
    </Box>
  );
return  <></>
};






