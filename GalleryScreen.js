import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FileSystem, FaceDetector } from 'expo';
import Expo from 'expo';
import ExpoPixi from 'expo-pixi';
import Sketch from './Sketch';
import RNDraw from 'rn-draw';
  


const pictureSize = 350;
const color = 0x0000ff;
const width = 5;
const alpha = 0.5;

export default class GalleryScreen extends React.Component {
    state = {
        faces: {},
        images: {},
        photos: [],
    };

    componentDidMount() {
        FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'photos').then(photos => {
            this.setState(
                {
                    photos,
                },
                this.detectFaces
            );
        });
    }

    getImageDimensions = ({ width, height }) => {
        if (width > height) {
            const scaledHeight = pictureSize * height / width;
            return {
                width: pictureSize,
                height: scaledHeight,

                scaleX: pictureSize / width,
                scaleY: scaledHeight / height,

                offsetX: 0,
                offsetY: (pictureSize - scaledHeight) / 2,
            };
        } else {
            const scaledWidth = pictureSize * width / height;
            return {
                width: scaledWidth,
                height: pictureSize,

                scaleX: scaledWidth / width,
                scaleY: pictureSize / height,

                offsetX: (pictureSize - scaledWidth) / 2,
                offsetY: 0,
            };
        }
    };

    detectFaces = () => this.state.photos.forEach(this.detectFace);

    detectFace = photoUri =>
        FaceDetector.detectFacesAsync(`${FileSystem.documentDirectory}photos/${photoUri}`, {
            detectLandmarks: FaceDetector.Constants.Landmarks.none,
            runClassifications: FaceDetector.Constants.Classifications.all,
        })
            .then(this.facesDetected)
            .catch(this.handleFaceDetectionError);

    facesDetected = ({ image, faces }) =>
        this.setState({
            faces: { ...this.state.faces, [image.uri]: faces },
            images: { ...this.state.images, [image.uri]: image },
        });

    handleFaceDetectionError = error => console.warn(error);

    renderFaces = photoUri =>
        this.state.images[photoUri] &&
        this.state.faces[photoUri] &&
        this.state.faces[photoUri].map(this.renderFace(this.state.images[photoUri]));

    renderFace = image => (face, index) => {
        const { scaleX, scaleY, offsetX, offsetY } = this.getImageDimensions(image);
        const layout = {
            top: offsetY + face.bounds.origin.y * scaleY,
            left: offsetX + face.bounds.origin.x * scaleX,
            width: face.bounds.size.width * scaleX,
            height: face.bounds.size.height * scaleY,
        };

        return (
            <View
                key={index}
                style={[styles.face, layout]}
                transform={[
                    { perspective: 600 },
                    { rotateZ: `${(face.rollAngle || 0).toFixed(0)}deg` },
                    { rotateY: `${(face.yawAngle || 0).toFixed(0)}deg` },
                ]}>
                <Text style={styles.faceText}>😁 {(face.smilingProbability * 100).toFixed(0)}%</Text>
            </View>
        );
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={this.props.onPress}>
                    <Text>Back</Text>
                </TouchableOpacity>

                {/* <ScrollView contentComponentStyle={{ flex: 1 }}> */}
                    <View style={styles.pictures}>
                        {this.state.photos.map(photoUri => (
                            <View style={styles.pictureWrapper} key={photoUri}>
                                            <RNDraw
  containerStyle={{zIndex:99}} 
  rewind={(undo) => {this._undo = undo}}
  clear={(clear) => {this._clear = clear}}
  color={'white'}
  strokeWidth={4}
>
                                <Image
                                    key={photoUri}
                                    style={styles.picture}
                                    source={{
                                        uri: `${FileSystem.documentDirectory}photos/${photoUri}`,
                                    }}
                                    />
                                    </RNDraw>
                                <View style={styles.facesContainer}>
                                    {this.renderFaces(`${FileSystem.documentDirectory}photos/${photoUri}`)}
                                </View>
        
                            </View>
                        ))}
        
                    </View>

                {/* </ScrollView> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    pictures: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    picture: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
        resizeMode: 'contain',
        zIndex: -1,
    },
    pictureWrapper: {
        width: pictureSize,
        height: pictureSize,
        margin: 5,
    },
    facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
    },
    face: {
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#FFD700',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    faceText: {
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 2,
        fontSize: 10,
        backgroundColor: 'transparent',
    },
    backButton: {
        padding: 20,
        marginBottom: 4,
        backgroundColor: 'indianred',
    },
});