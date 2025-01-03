import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Badge, Box, Button, CircularProgress, CircularProgressLabel,
  Container, Flex, Heading, Image, Spinner, Text, useToast,
  useColorModeValue, Modal, ModalOverlay, ModalContent,
  ModalCloseButton, ModalBody, VStack, Collapse,

 
} from "@chakra-ui/react";
import { CalendarIcon, CheckCircleIcon,  SmallAddIcon, TimeIcon } from "@chakra-ui/icons";
import {
  fetchCredits, fetchDetails, imagePathOriginal
} from "../../services/api";
import {
  minutesTohours, ratingToPercentage, resolveRatingColor
} from "../../../../function/helpers";
import { useAuth } from "../../context/useAuth";


import ArtPlayerComponent from "../../components/player2";


const Movie = () => {
  const { id, tmdb } = useParams();
  const { checkIfInTaste, updateTaste, user, getByTmdbOrImagePath, streamingserverurl } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imagePath = decodeURIComponent(params.get("imgPath"));
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isInTaste, setIsInTaste] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [serveurs, setServeurs] = useState([]);
  const [serveurSelectionné, setServeurSelectionné] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

 
  


     const overlayColor = useColorModeValue("rgba(255,255,255,0.88)", "rgba(0,0,0,0.88)");
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const secondaryTextColor = useColorModeValue("yellow.600", "yellow.400");
  const [StreamingAccess, setStreamingAccess] = useState(undefined);

  useLayoutEffect(() => {
    const access = {
      username: !!user?.StreamingAccess?.username?.trim() ? user.StreamingAccess.username : null,
      password: !!user?.StreamingAccess?.username?.trim() ? user.StreamingAccess.password : null
    };
    setStreamingAccess(access);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsData] = await Promise.all([
          fetchDetails("movie", tmdb),
          fetchCredits("movie", tmdb),
        ]);
   
        setDetails(detailsData);

        if (user) {
          const inTaste = await checkIfInTaste(id, "movie");
           const isd= !!user.downloads.find(d=>d.movieId===id)
           setIsDownloaded(isd)
          setIsInTaste(inTaste);

          const similarMoviesData = await getByTmdbOrImagePath(tmdb, imagePath, "movie");
          setServeurs(similarMoviesData);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, checkIfInTaste, getByTmdbOrImagePath]);

  const handleAddToTaste = async () => {
    if (!user) {
      toast({ title: "Connectez-vous pour ajouter à la liste des goûts", status: "error", isClosable: true });
      return;
    }
    await updateTaste(id, null, true);
    setIsInTaste(true);
    toast({ title: "Ajouté à la liste des goûts", status: "success", isClosable: true });
  };

  const handleRemoveFromTaste = async () => {
    await updateTaste(id, null, false);
    setIsInTaste(false);
    toast({ title: "Retiré de la liste des goûts", status: "info", isClosable: true });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh" bg={bgColor}>
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  const title = details?.title || details?.name;
  const releaseDate = details?.release_date || details?.first_air_date;

  return (
    <Box bg="transparent" color={textColor} w="100%" minH="100vh">
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
      <Container maxW="container.xl" p={{ base: 4, md: 8 }}>
        <Flex alignItems="center" gap={6} flexDirection={{ base: "column", md: "row" }} overflow="hidden">
          <Image height={{ base: "300px", md: "450px" }} width="auto" borderRadius="sm" src={imagePath} alt={title} />
          <Box flex="1" width="100%">
            <Heading fontSize={{ base: "2xl", md: "3xl" }} mb={2}>
              {title} <Text as="span" fontWeight="normal" color={secondaryTextColor}>{new Date(releaseDate).getFullYear()}</Text>
            </Heading>
            <Flex alignItems="center" gap="4" mt={1} mb={5}>
              <CalendarIcon mr={2} color={secondaryTextColor} />
              <Text fontSize="sm">{new Date(releaseDate).toLocaleDateString("fr-FR")} (FR)</Text>
              <TimeIcon mr={2} color={secondaryTextColor} />
              <Text fontSize="sm">{minutesTohours(details?.runtime)}</Text>
            </Flex>
            <Flex gap="4" alignItems="center">
              <CircularProgress
                value={ratingToPercentage(details?.vote_average)}
                size="70px"
                color={resolveRatingColor(details?.vote_average)}
                thickness="6px"
              >
                <CircularProgressLabel fontSize="lg">{ratingToPercentage(details?.vote_average)}%</CircularProgressLabel>
              </CircularProgress>
              <Text display={{ base: "none", lg: "initial" }}>Note des utilisateurs</Text>
              {isInTaste ? (
                <Button leftIcon={<CheckCircleIcon />} colorScheme="green" variant="outline" onClick={handleRemoveFromTaste}>Dans MyList</Button>
              ) : (
                <Button leftIcon={<SmallAddIcon />} variant="outline" onClick={handleAddToTaste}>Ma Liste</Button>
              )}
            
           
            </Flex>
            <Text color={secondaryTextColor} fontSize="sm" fontStyle="italic" my="5">{details?.tagline}</Text>
            <Heading fontSize="xl" mb="3">Résumé</Heading>
            <Text fontSize="md" mb="3">{details?.overview}</Text>
            <Flex mt="6" gap="2" wrap="wrap">
              {details?.genres?.map((genre) => (
                <Badge key={genre?.id} p="1" bg={secondaryTextColor} color="white">{genre?.name}</Badge>
              ))}
            </Flex>
          </Box>
        </Flex>
        {StreamingAccess && StreamingAccess?.username && StreamingAccess?.password && (
          <Box width="100%" mt={6}>
            <Button width="100%" colorScheme="red" onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Cacher Options" : "Regarder"}</Button>
            <Collapse in={isOpen} animateOpacity>
              <VStack align="stretch" mt={4}>
                {serveurs?.map((film, index) => (
                  
                  <Button key={index} value={film.id} width="100%" colorScheme={selectedValue === film.id ? "blue" : "gray"} onClick={() => { setServeurSelectionné(film); setSelectedValue(film.id); }}>
                    Regarder {index + 1} {film.name} {film.extension}
                  </Button>
                ))}
              </VStack>
            </Collapse>
          </Box>
       
       )}
      </Container>

      {serveurSelectionné && (
        <Modal isOpen={!!serveurSelectionné} onClose={() => setServeurSelectionné(null)} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(5px)" />
          <ModalContent maxW="90vw" maxH="90vh" bg="transparent" margin="auto">
            <ModalCloseButton top="10px" right="10px" color="white" zIndex={11} bg="rgba(0,0,0,0.5)" _hover={{ bg: "rgba(0, 0, 0, 0.7)" }} borderRadius="full" />
            <ModalBody p={0 } >
            <ArtPlayerComponent   videourl={`${streamingserverurl}/movie/${user.StreamingAccess.username}/${user.StreamingAccess.password}/${serveurSelectionné.indexer}.${serveurSelectionné.extension}`} ></ArtPlayerComponent>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default Movie;




